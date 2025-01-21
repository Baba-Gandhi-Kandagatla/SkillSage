import { Request, Response } from "express";
import { generateInterviewQuestion, provideInterviewFeedback, generateNextInterviewQuestion, generateNextCodingQuestion, provideFinalInterviewFeedback, provideCodingFeedback, rephraseInterviewQuestion, generateEvaluationMatrix } from "../Api-helper/helper.js";
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
      if (interviewInstance.status === 'submitted') {
        await transaction.rollback();
        return res.status(400).json({ message: "Interview already submitted." });
      }

      const interviewExchanges = await InterviewExchange.findAll({
        where: { interview_ins_ref: interviewInstance.id },
        order: [['id', 'ASC']]
      });

      if (interviewExchanges.length === interview.no_of_questions + interview.no_of_coding_questions) {
        const lastExchange = interviewExchanges[interviewExchanges.length - 1];
        if (lastExchange.response!="" && lastExchange.feedback!="") {
          await transaction.rollback();
          return res.status(200).json({ 
            message: "Interview already completed.",
            status: 'complete',
            interviewExchanges 
          });
        }
      }

      await transaction.rollback();
      return res.status(200).json({
        status: 'incomplete',
        interviewExchanges
      });
    }

    interviewInstanceData = await InterviewInstance.create({
      interview_ref: interview_id as any as bigint,
      student_roll,
      marks: 0,
      feedback: { strengths: "", weaknesses: "", summary: "" },
      status: "not submitted"
    }, { transaction });

    interviewInstance = interviewInstanceData.get();

    const resume = await fetchResumeContext(student_roll);
    const firstQuestion = await generateInterviewQuestion(interview.subject, interview.topic, resume);

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
      interviewExchange
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
    const { interview_id } = req.params;
    const student_roll = res.locals.jwtData.rollnumber;
    const { response: studentResponse } = req.body;

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
    if ((interviewExchanges.length >= (interview.no_of_questions + interview.no_of_coding_questions)) && lastExchange.response!= "" ) {
      await transaction.rollback();
      return res.status(200).json({ message: "You have already answered all the questions." });
    }

    if (!lastExchange.response) {
      if (interviewExchanges.length >= interview.no_of_questions)
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

      if (interviewExchanges.length === interview.no_of_questions + interview.no_of_coding_questions) {
        await transaction.commit();
        return res.status(200).json({ status: 'complete', interviewExchanges });
      }
    }

    const resume = await fetchResumeContext(student_roll);
    let nextQuestion,code;
    if(interviewExchanges.length >= interview.no_of_questions) {
      const response = await generateNextCodingQuestion(resume, interview.subject, interview.topic, interviewExchanges);
      nextQuestion = response.question;
      code = response.code;
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

    const interviewExchangesData = await InterviewExchange.findAll({
      where: { interview_ins_ref: interviewInstance.id },
      order: [['id', 'ASC']]
    });

    const interviewExchanges = (interviewExchangesData)?interviewExchangesData.map((exchange) => exchange.get()):null;
    if (interviewExchanges.length !== interview.no_of_questions + interview.no_of_coding_questions || interviewExchanges[interviewExchanges.length - 1].response=="") {
      await transaction.rollback();
      return res.status(400).json({
        message: "You have not answered all the questions yet. Please answer or skip the question."
      });
    }

    const resume = await fetchResumeContext(student_roll);
    const finalFeedback = await provideFinalInterviewFeedback(resume, interview.subject, interview.topic, interviewExchanges);
    const totalMarks = interviewExchanges.reduce((sum, exchange) => sum + exchange.marks, 0);
    const averageMarks = Math.round(totalMarks / interviewExchanges.length);
    interviewInstance.feedback = finalFeedback;
    interviewInstance.marks = averageMarks;
    const {problem_solving,code_quality,debugging} = await generateEvaluationMatrix(resume, interview.subject, interview.topic, interviewExchanges);


    const evalData = await EvalMetrics.findOne({ where: { roll_number: student_roll } });
    if (!evalData) {
      await EvalMetrics.create({ roll_number: student_roll, problem_solving: problem_solving, code_quality: code_quality, debugging: debugging , count: 1 });
    }
    else{
      const eval_metrics = evalData.get();
      eval_metrics.count +=1; 
      eval_metrics.problem_solving = (eval_metrics.problem_solving*(eval_metrics.count-1) + problem_solving)/eval_metrics.count;
      eval_metrics.code_quality = (eval_metrics.code_quality*(eval_metrics.count-1) + code_quality)/eval_metrics.count;
      eval_metrics.debugging = (eval_metrics.debugging*(eval_metrics.count-1) + debugging)/eval_metrics.count;
      await EvalMetrics.update({ problem_solving: eval_metrics.problem_solving, code_quality: eval_metrics.code_quality, debugging: eval_metrics.debugging, count: eval_metrics.count}, { where: { roll_number: student_roll } });
    }
    interviewInstance.status = 'submitted';
    await InterviewInstance.update({
      status: 'submitted',
      marks: averageMarks,
      feedback: finalFeedback
    }, { where: { interview_ref: interview_id, student_roll }, transaction });

    await transaction.commit();
    return res.status(200).json({ status: 'submitted', interviewInstance, interviewExchanges });

  } catch (error) {
    console.error('Error in submitInterview:', error);
    await transaction.rollback();
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};
