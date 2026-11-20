import { Request, Response } from "express";
import { generateInterviewQuestion, provideInterviewFeedback, generateNextInterviewQuestion, generateNextCodingQuestion, provideFinalInterviewFeedback, provideCodingFeedback, rephraseInterviewQuestion, generateEvaluationMatrix,generateSkillEvaluationWithInt } from "../Api-helper/helper.js";
import sequelize from "../db/connection.js"; 
import Interview from "../models/Interview.js";
import InterviewInstance from "../models/Interview_ins.js";
import InterviewExchange from "../models/InterviewExchanges.js";
import Resume from "../models/Resume.js";
import EvalMetrics from "../models/Eval_metrics.js";





const fetchInterview = async (interview_id: string) => {
  let interview = await Interview.findOne({ where: { id: interview_id, status: 'active' } });
  return interview ? interview.get() : null;
};




const fetchResumeContext = async (student_roll: string) => {
  const resumeData = await Resume.findOne({ where: { roll_number: student_roll } });
  return resumeData ? resumeData.get().resume_context : "I am a student studying in a college with little to no experience.";
};




export const startInterview = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction(); 
  try {
    const currentIp = req.ip;
    const { interview_id } = req.params;
    const student_roll = res.locals.jwtData.rollnumber;

    const interview = await fetchInterview(interview_id);
    if (!interview) {
      await transaction.rollback();
      return res.status(404).json({ message: "Interview not found or is not active." });
    }

    let interviewInstanceData = await InterviewInstance.findOne({ where: { interview_ref: interview_id, student_roll } });
    let interviewInstance = (interviewInstanceData)?interviewInstanceData.get():null;

    if (interviewInstance) {
      // Verify client IP
      if (interviewInstance.ip !== currentIp) {
        await InterviewInstance.update(
          { ip: currentIp, boolIpChange: true },
          { where: { id: interviewInstance.id }, transaction }
        );
        interviewInstance.ip = currentIp;
        interviewInstance.boolIpChange = true;
      }
      if (interviewInstance.status === 'submitted') {
        await transaction.rollback();
        return res.status(400).json({ message: "Interview already submitted." });
      }

      const interviewExchanges = await InterviewExchange.findAll({
        where: { interview_ins_ref: interviewInstance.id },
        order: [['id', 'ASC']]
      });

      if (interviewExchanges.length === interview.no_of_questions + interview.no_of_coding_questions + interview.predefined_questions.length) {
        const lastExchange = interviewExchanges[interviewExchanges.length - 1];
        if (lastExchange.response!="" && lastExchange.feedback!="") {
          await transaction.rollback();
          return res.status(200).json({ 
            message: "Interview already completed.",
            status: 'complete',
            interviewExchanges,
            interview, 
          });
        }
      }

      await transaction.rollback();
      return res.status(200).json({
        status: 'incomplete',
        interviewExchanges,
        interview, 
      });
    }
    console.log(currentIp + " " + " " + req.ip+"  \n\n\n") ;
    // Create new instance with current IP
    interviewInstanceData = await InterviewInstance.create({
      interview_ref: interview_id as any as bigint,
      student_roll,
      marks: 0,
      feedback: { strengths: "", weaknesses: "", summary: "" },
      violation: 0,
      ip: currentIp,
      boolIpChange: false,
      status: "not submitted"
    }, { transaction });

    interviewInstance = interviewInstanceData.get();
    let firstQuestion = "";
    if(interview.predefined_questions!= null && interview.predefined_questions.length > 0)
    {
      firstQuestion = interview.predefined_questions[0];
    }
    else{
          const resume = await fetchResumeContext(student_roll);
          firstQuestion = await generateInterviewQuestion(interview.subject, interview.topic, resume);
    }
    const interviewExchange = await InterviewExchange.create({
      interview_ins_ref: interviewInstance.id,
      question: firstQuestion,
      response: "",
      feedback: "",
      marks: 0
    }, { transaction });

    await transaction.commit();
    return res.status(201).json({
      status: 'incomplete',
      interviewExchange,
      interview, 
    });

  } catch (error) {
    console.error('Error in startInterview:', error);
    await transaction.rollback(); 
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};



export const getNext = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const currentIp = req.ip;
    const { interview_id } = req.params;
    const student_roll = res.locals.jwtData.rollnumber;
    const { response: studentResponse } = req.body;
    if(studentResponse == "")
    {
      await transaction.rollback();
      return res.status(400).json({ message: "Response cannot be empty." });
    }

    const interview = await fetchInterview(interview_id);
    if (!interview) {
      await transaction.rollback();
      return res.status(404).json({ message: "Interview not found or is not active." });
    }

    const interviewInstanceData = await InterviewInstance.findOne({ where: { interview_ref: interview_id, student_roll } });
    const interviewInstance = (interviewInstanceData)?interviewInstanceData.get():null;
    if (!interviewInstance) {
      await transaction.rollback();
      return res.status(400).json({ message: "Please start the interview first." });
    }

    // Verify client IP
    if (interviewInstance.ip !== currentIp) {
      await InterviewInstance.update({ ip: currentIp, boolIpChange: true }, { where: { id: interviewInstance.id }, transaction });
      interviewInstance.ip = currentIp;
      interviewInstance.boolIpChange = true;
    }

    if (interviewInstance.status === 'submitted') {
      await transaction.rollback();
      return res.status(400).json({ message: "Interview already submitted." });
    }

    const interviewExchangesData = await InterviewExchange.findAll({
      where: { interview_ins_ref: interviewInstance.id },
      order: [['id', 'ASC']]
    });
    const interviewExchanges = (interviewExchangesData)?interviewExchangesData.map((exchange) => exchange.get()):null;

    if (!interviewExchanges) {
      await transaction.rollback();
      return res.status(400).json({ message: "Something went wrong very Bad , Pls meet the admin(Kandagatla Baba Gandhi)." });
    }
    console.log(interviewExchanges.length);
    console.log(interview.no_of_questions + interview.no_of_coding_questions);
    const lastExchange = interviewExchanges[interviewExchanges.length - 1];
    if ((interviewExchanges.length >= (interview.no_of_questions + interview.no_of_coding_questions+ interview.predefined_questions.length)) && lastExchange.response!= "" ) {
      await transaction.rollback();
      return res.status(200).json({ message: "You have already answered all the questions." });
    }

    if (!lastExchange.response) {
      if (interviewExchanges.length >= interview.no_of_questions+interview.predefined_questions.length) 
      {
        const{feedback, marks}  = await provideCodingFeedback(lastExchange.question, lastExchange.code, studentResponse);
        lastExchange.feedback = feedback;
        lastExchange.response = studentResponse;
        lastExchange.marks = marks;
      }
      else{
        const{feedback, marks}  = await provideInterviewFeedback(lastExchange.question, studentResponse);
        lastExchange.feedback = feedback;
        lastExchange.response = studentResponse;
        lastExchange.marks = marks;
      }
      
      await InterviewExchange.update(
        { response: studentResponse, feedback: lastExchange.feedback,marks: lastExchange.marks },
        { where: { id: lastExchange.id }, transaction }
      );

      if (interviewExchanges.length === interview.no_of_questions + interview.no_of_coding_questions+interview.predefined_questions.length) {
        await transaction.commit();
        return res.status(200).json({ status: 'complete', interviewExchanges });
      }
    }

    const resume = await fetchResumeContext(student_roll);
    let nextQuestion,code;
    if(interviewExchanges.length < interview.predefined_questions.length)
    {
      nextQuestion = interview.predefined_questions[interviewExchanges.length];
    }
    else if(interviewExchanges.length >= interview.no_of_questions+interview.predefined_questions.length) {
      const response = await generateNextCodingQuestion(resume, interview.subject, interview.topic, interviewExchanges);
      nextQuestion = response.question;
      code = response.question_code;
    }
    else{
      nextQuestion = await generateNextInterviewQuestion(resume, interview.subject, interview.topic, interviewExchanges);
    }
    await InterviewExchange.create({
      interview_ins_ref: interviewInstance.id,
      question: nextQuestion,
      code: code || "",
      response: "",
      feedback: "",
      marks: 0
    }, { transaction });
    
    await transaction.commit();
    const updatedExchangesData = await InterviewExchange.findAll({
      where: { interview_ins_ref: interviewInstance.id },
      order: [['id', 'ASC']]
    });
    const updatedExchanges =  (updatedExchangesData)?updatedExchangesData.map((exchange) => exchange.get()):null;
    
    return res.status(200).json({ status: 'incomplete', interviewExchanges: updatedExchanges });

  } catch (error) {
    console.error('Error in getNext:', error);
    await transaction.rollback();
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};



export const reframeLastQuestion = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const currentIp = req.ip;
    const { interview_id } = req.params;
    const student_roll = res.locals.jwtData.rollnumber;

    const interview = await fetchInterview(interview_id);
    if (!interview) {
      await transaction.rollback();
      return res.status(404).json({ message: "Interview not found or is not active." });
    }

    const interviewInstanceData = await InterviewInstance.findOne({ where: { interview_ref: interview_id, student_roll } });
    const interviewInstance = (interviewInstanceData)?interviewInstanceData.get():null;
    if (!interviewInstance) {
      await transaction.rollback();
      return res.status(400).json({ message: "Please start the interview first." });
    }

    // Verify client IP
    if (interviewInstance.ip !== currentIp) {
      await InterviewInstance.update({ ip: currentIp, boolIpChange: true }, { where: { id: interviewInstance.id }, transaction });
      interviewInstance.ip = currentIp;
      interviewInstance.boolIpChange = true;
    }

    if (interviewInstance.status === 'submitted') {
      await transaction.rollback();
      return res.status(400).json({ message: "Interview already submitted." });
    }

    const interviewExchangesData = await InterviewExchange.findAll({
      where: { interview_ins_ref: interviewInstance.id },
      order: [['id', 'ASC']]
    });

    const interviewExchanges = (interviewExchangesData)?interviewExchangesData.map((exchange) => exchange.get()):null;

    if(!interviewExchanges)
    {
      await transaction.rollback();
      return res.status(400).json({ message: "Something went wrong very Bad , Pls meet the admin(Kandagatla Baba Gandhi)." });
    }

    const lastExchange = interviewExchanges[interviewExchanges.length - 1];
    if (interviewExchanges.length === interview.no_of_questions + interview.no_of_coding_questions && lastExchange.response!="") {
      await transaction.rollback();
      return res.status(200).json({ message: "You have already answered all the questions." });
    }

    const reframedQuestion = await rephraseInterviewQuestion(lastExchange.question);
    lastExchange.question = reframedQuestion;
    await InterviewExchange.update({ question: reframedQuestion }, { where: { id: lastExchange.id }, transaction });

    await transaction.commit();
    return res.status(200).json({
      message: "The last question has been reframed.",
      interviewExchanges
    });

  } catch (error) {
    console.error('Error in reframeLastQuestion:', error);
    await transaction.rollback();
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};



export const submitInterview = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const currentIp = req.ip;
    const { interview_id } = req.params;
    const student_roll = res.locals.jwtData.rollnumber;

    // 1. Fetch interview
    const interview = await fetchInterview(interview_id);
    if (!interview) {
      await transaction.rollback();
      return res.status(404).json({ message: "Interview not found or is not active." });
    }

    // 2. Fetch instance
    const instanceData = await InterviewInstance.findOne({
      where: { interview_ref: interview_id, student_roll },
      transaction
    });
    if (!instanceData) {
      await transaction.rollback();
      return res.status(400).json({ message: "Please start the interview first." });
    }
    const interviewInstance = instanceData.get();

    // 3. Verify client IP
    if (interviewInstance.ip !== currentIp) {
      await InterviewInstance.update(
        { ip: currentIp, boolIpChange: true },
        { where: { id: interviewInstance.id }, transaction }
      );
      interviewInstance.ip = currentIp;
      interviewInstance.boolIpChange = true;
    }

    // 4. Prevent double submission
    if (interviewInstance.status === 'submitted') {
      await transaction.rollback();
      return res.status(400).json({ message: "Interview already submitted." });
    }

    // 5. Ensure all questions are answered or skipped
    const exchangesData = await InterviewExchange.findAll({
      where: { interview_ins_ref: interviewInstance.id },
      order: [['id', 'ASC']],
      transaction
    });
    const exchanges = exchangesData.map(e => e.get());
    const expected = interview.no_of_questions
      + interview.no_of_coding_questions
      + interview.predefined_questions.length;

    if (
      exchanges.length !== expected ||
      exchanges.some(e => e.response === "")
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message: "You have not answered all the questions yet. Please answer or skip the question."
      });
    }

    // ─────────────────────────────────────────────
    // 6. MARK AS SUBMITTED RIGHT AWAY
    await InterviewInstance.update(
      { status: 'submitted' },
      { where: { id: interviewInstance.id }, transaction }
    );
    interviewInstance.status = 'submitted';

    // 7. Compute feedback and marks
    const resume = await fetchResumeContext(student_roll);
    const finalFeedback = await provideFinalInterviewFeedback(
      resume,
      interview.subject,
      interview.topic,
      exchanges
    );
    const totalMarks = exchanges.reduce((sum, ex) => sum + ex.marks, 0);
    const averageMarks = totalMarks / exchanges.length;

    // 8. Update marks & feedback
    await InterviewInstance.update(
      { marks: averageMarks, feedback: finalFeedback },
      { where: { id: interviewInstance.id }, transaction }
    );
    interviewInstance.marks = averageMarks;
    interviewInstance.feedback = finalFeedback;

    // 9. Update evaluation metrics
    const { problem_solving, code_quality, debugging } = await generateEvaluationMatrix(
      resume,
      interview.subject,
      interview.topic,
      exchanges
    );
    const evalData = await EvalMetrics.findOne({
      where: { roll_number: student_roll },
      transaction
    });
    const { skills } = await generateSkillEvaluationWithInt(
      interview.subject,
      interview.topic,
      exchanges,
      evalData?.get().skills
    );

    if (!evalData) {
      await EvalMetrics.create(
        {
          roll_number: student_roll,
          problem_solving,
          code_quality,
          debugging,
          count: 1,
          skills
        },
        { transaction }
      );
    } else {
      const metrics = evalData.get();
      const newCount = metrics.count + 1;
      await EvalMetrics.update(
        {
          problem_solving: (metrics.problem_solving * metrics.count + problem_solving) / newCount,
          code_quality: (metrics.code_quality * metrics.count + code_quality) / newCount,
          debugging: (metrics.debugging * metrics.count + debugging) / newCount,
          count: newCount,
          skills
        },
        { where: { roll_number: student_roll }, transaction }
      );
    }

    // 10. Commit and respond
    await transaction.commit();
    return res.status(200).json({
      status: 'submitted',
      interviewInstance,
      interviewExchanges: exchanges
    });

  } catch (error) {
    console.error('Error in submitInterview:', error);
    await transaction.rollback();
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};

export const increaseViolation = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { interview_id } = req.params;
    const student_roll = res.locals.jwtData.rollnumber;

    const interview = await fetchInterview(interview_id);
    if (!interview) {
      await transaction.rollback();
      return res.status(404).json({ message: "Interview not found or is not active." });
    }

    const interviewInstanceData = await InterviewInstance.findOne({ where: { interview_ref: interview_id, student_roll } });
    const interviewInstance = (interviewInstanceData)?interviewInstanceData.get():null;
    if (!interviewInstance) {
      await transaction.rollback();
      return res.status(400).json({ message: "Please start the interview first." });
    }
    if (interviewInstance.status === 'submitted') {
      await transaction.rollback();
      return res.status(400).json({ message: "Interview already submitted." });
    }

    interviewInstance.violation += 1;
    await InterviewInstance.update({ violation: interviewInstance.violation }, { where: { interview_ref: interview_id, student_roll }, transaction });

    await transaction.commit();
    return res.status(200).json({ violation: interviewInstance.violation });

  } catch (error) {
    console.error('Error in increaseViolation:', error);
    await transaction.rollback();
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
}