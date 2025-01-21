import React from 'react';

const LoadingSkillSage: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-[#FCFFF8]">
            <img 
                src="OWL.png" 
                alt="Loading" 
                className="w-80 h-80 animate-pulse duration-1000"
            />
        </div>
    );
};

export default LoadingSkillSage;