import Interview from './Interview.js';
import InterviewToDepartment from './InterviewToDepartments.js';
import Department from './Department.js';
import InterviewExchange from './InterviewExchanges.js';
import College from './College.js';
import InterviewInstance from './Interview_ins.js';
import Student from './student.js';
import EvalMetrics from './Eval_metrics.js';

const setupAssociations = () => {
  Interview.hasMany(InterviewToDepartment, { foreignKey: 'interview_id' });
  InterviewToDepartment.belongsTo(Interview, { foreignKey: 'interview_id' });
  InterviewToDepartment.belongsTo(Department, { foreignKey: 'department_id' });
  Interview.hasMany(InterviewExchange, { foreignKey: 'interview_id' });
  Department.belongsTo(College, { foreignKey: 'college_id' });
  
    InterviewInstance.belongsTo(Interview, { foreignKey: 'interview_ref' });
    InterviewInstance.belongsTo(Student, { foreignKey: 'student_roll' });
    InterviewInstance.hasMany(InterviewExchange, { foreignKey: 'interview_ins_ref' });
    InterviewExchange.belongsTo(InterviewInstance, { foreignKey: 'interview_ins_ref' });
    Student.hasMany(InterviewInstance, { foreignKey: 'student_roll' });
    InterviewInstance.belongsTo(Student, { foreignKey: 'student_roll' });
    Interview.hasMany(InterviewInstance, { foreignKey: 'interview_ref' });
      
  EvalMetrics.belongsTo(Student, { foreignKey: 'roll_number' });
  Student.hasMany(EvalMetrics, { foreignKey: 'roll_number' });
};

export default setupAssociations;
