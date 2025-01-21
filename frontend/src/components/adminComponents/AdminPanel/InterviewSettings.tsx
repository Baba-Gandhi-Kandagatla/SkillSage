import { LoadingModal } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion"; 
import {
    Save
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getInterviewPreferences, setInterviewPreferences } from "@/Communicators/apiCommunications";
import toast from "react-hot-toast";
import ReactDOM from "react-dom"; // Change this import

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } },
};

const AnimatedButton = motion(Button);



export const InterviewSettings = () => {
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [codingQuestionPercentage, setCodingQuestionPercentage] = useState(5);

  const [initialState, setInitialState] = useState({
    totalQuestions: 15,
    codingQuestionPercentage: 50,
  });

  const [hasChanges, setHasChanges] = useState({
    interviewSettings: false,
  });

  const [isSaving, setIsSaving] = useState(false); // Add state for loading modal

  useEffect(() => {
    getInterviewPreferences().then((prefs) => {
      if (prefs) {
        // console.log(prefs);
        setTotalQuestions(prefs.total_questions);
        setCodingQuestionPercentage(prefs.no_of_coding_questions);
        setInitialState({
          totalQuestions: prefs.total_questions || 0,
          codingQuestionPercentage: prefs.no_of_coding_questions || 0,
        });
      }
    });
  }, []);

  useEffect(() => {
    setHasChanges((prevState) => ({
      ...prevState,
      interviewSettings:
        totalQuestions !== initialState.totalQuestions ||
        codingQuestionPercentage !== initialState.codingQuestionPercentage,
    }));
  }, [totalQuestions, codingQuestionPercentage, initialState]);

  const handleSave = useCallback(async () => {
    const sum = totalQuestions + codingQuestionPercentage;
    if(codingQuestionPercentage > totalQuestions){
      toast.error("Coding questions should be less than total questions");
      return;
    }
    if (sum < 5 || sum > 20) {
      // ...show error or toast..
      toast.error("Total questions and coding questions should be between 5 and 20");
      return;
    }
    setIsSaving(true); // Show loading modal
    try {
      await setInterviewPreferences({
        totalQuestions,
        codingQuestions: codingQuestionPercentage,
      });
      setInitialState({
        totalQuestions,
        codingQuestionPercentage,
      });
      setHasChanges((prevState) => ({
        ...prevState,
        interviewSettings: false,
      }));
      // Simulate save logic with a timeout
      setTimeout(() => {
        setIsSaving(false); // Hide loading modal after save
        toast.success("Interview preferences saved!"); // Show toast after modal
      }, 500);
    } catch (error) {
      // ...error handling...
      setIsSaving(false); // Ensure modal is hidden on error
      toast.error("Failed to save interview preferences");
    }
  }, [totalQuestions, codingQuestionPercentage]);

  return (
    <>
      <TabsContent value="interview-settings">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Interview Settings</CardTitle>
            <CardDescription>
              Configure interview parameters and matching settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="total-questions">Total Questions</Label>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-4">
                  <Slider
                    id="total-questions"
                    min={5}
                    max={20}
                    step={1}
                    value={[totalQuestions]}
                    onValueChange={(value) => setTotalQuestions(value[0])}
                    className="flex-grow"
                  />
                  <span className="font-medium">{totalQuestions}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coding-percentage">
                  Coding Questions
                </Label>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-4">
                  <Slider
                    id="coding-percentage"
                    min={0}
                    max={10}
                    step={1}
                    value={[codingQuestionPercentage]}
                    onValueChange={(value) =>
                      setCodingQuestionPercentage(value[0])
                    }
                    className="flex-grow"
                  />
                  <span className="font-medium">
                    {codingQuestionPercentage}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <AnimatedButton
              onClick={handleSave}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={!hasChanges.interviewSettings}
              className="w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Interview Settings
            </AnimatedButton>
          </CardFooter>
        </Card>
      </TabsContent>
      {ReactDOM.createPortal(
        <LoadingModal isOpen={isSaving} message="Saving changes..." />,
         document.body
      )}
    </>
  );
};