import { getAllDepartments, getSubjects, getInterviewPreferences } from "@/Communicators/apiCommunications";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Loader2, Plus, AlertCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function CreateInterviewCard({
  onCreateInterview,
}: {
  onCreateInterview: (newInterview: {
    name: string;
    subject: string;
    department: string;
    topic: string;
    predefined_questions: string[];
  }) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [isDetailsComplete, setIsDetailsComplete] = useState(false);

  useEffect(() => {
    getAllDepartments().then((res) => {
      const departments = res.map((department: { name: string }) => department.name);
      setAllDepartments(departments);
    });
  }, []);

  // Reset the active tab when the dialog is closed
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset to the details tab when dialog closes
      setTimeout(() => setActiveTab("details"), 300);
    }
  };

  const handleCreateInterview = (newInterview: {
    name: string;
    subject: string;
    department: string;
    topic: string;
    predefined_questions: string[];
  }) => {
    // Reset the active tab immediately before closing the dialog
    setActiveTab("details");
    onCreateInterview(newInterview);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Interview</DialogTitle>
        </DialogHeader>
        <CreateInterviewForm
          onSubmit={handleCreateInterview}
          allDepartments={allDepartments}
          setIsDetailsComplete={setIsDetailsComplete}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDetailsComplete={isDetailsComplete}
        />
      </DialogContent>
    </Dialog>
  );
}

interface CreateInterviewFormProps {
  onSubmit: (newInterview: {
    name: string;
    subject: string;
    department: string;
    topic: string;
    predefined_questions: string[];
  }) => void;
  allDepartments: string[];
  setIsDetailsComplete: (isComplete: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDetailsComplete: boolean;
}

function CreateInterviewForm({ 
  onSubmit, 
  allDepartments, 
  setIsDetailsComplete, 
  activeTab, 
  setActiveTab,
  isDetailsComplete 
}: CreateInterviewFormProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [predefinedQuestions, setPredefinedQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  // New state for subjects list and topics by subject
  const [subjectsList, setSubjectsList] = useState<{name: string, subtopics: string[]}[]>([]);
  const [selectedSubjectTopics, setSelectedSubjectTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Add state for interview preferences
  const [preferences, setPreferences] = useState<{questions: number, codingQuestions: number}>({
    questions: 0,
    codingQuestions: 0
  });

  useEffect(() => {
    setIsLoading(true);
    
    // Fetch subjects
    getSubjects()
      .then((data) => {
        setSubjectsList(data.subjects || []);
      })
      .catch((error) => {
        console.error("Failed to load subjects:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
    
    // Fetch interview preferences with updated mapping
    getInterviewPreferences()
      .then((data) => {
        setPreferences({
          questions: data.total_questions || 0,
          codingQuestions: data.no_of_coding_questions || 0
        });
      })
      .catch((error) => {
        console.error("Failed to load preferences:", error);
      });
  }, []);

  // Update available topics when subject changes
  useEffect(() => {
    if (subject) {
      const selectedSubject = subjectsList.find(s => s.name === subject);
      setSelectedSubjectTopics(selectedSubject?.subtopics || []);
      setTopics([]); // Clear selected topics when subject changes
    } else {
      setSelectedSubjectTopics([]);
    }
  }, [subject, subjectsList]);

  // Check if details are complete
  useEffect(() => {
    const detailsComplete = name && subject && departments.length > 0 && topics.length > 0;
    setIsDetailsComplete(detailsComplete);
  }, [name, subject, departments, topics, setIsDetailsComplete]);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (name && subject && departments.length > 0 && topics.length > 0) {
      onSubmit({
        name,
        subject,
        department: departments.join(", "),
        topic: topics.join(", "),
        predefined_questions: predefinedQuestions,
      });

      setName("");
      setSubject("");
      setDepartments([]);
      setTopics([]);
      setPredefinedQuestions([]);
    }
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    if (checked) {
      setTopics([...topics, topic]);
    } else {
      setTopics(topics.filter(t => t !== topic));
    }
  };

  const selectAllTopics = () => {
    setTopics([...selectedSubjectTopics]);
  };

  const deselectAllTopics = () => {
    setTopics([]);
  };

  const addPredefinedQuestion = () => {
    if (currentQuestion.trim()) {
      setPredefinedQuestions([...predefinedQuestions, currentQuestion.trim()]);
      setCurrentQuestion("");
    }
  };

  const removePredefinedQuestion = (index: number) => {
    setPredefinedQuestions(predefinedQuestions.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addPredefinedQuestion();
    }
  };

  const continueToQuestions = () => {
    if (isDetailsComplete) {
      setActiveTab("questions");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="details" className="text-center">Interview Details</TabsTrigger>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* No more random <div> — TabsTrigger will now fill its column */}
              <TabsTrigger
                value="questions"
                disabled={!isDetailsComplete}
                className={`w-full text-center ${
                      isDetailsComplete
                        ? 'data-[state=active]:bg-white data-[state=active]:text-black'
                        : 'cursor-not-allowed opacity-50'
                }`}
              >
                Predefined Questions
              </TabsTrigger>
            </TooltipTrigger>
            {!isDetailsComplete && (
              <TooltipContent className="bg-black text-white p-3 text-sm font-medium max-w-[250px]">
                <p>Complete interview details first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <div>
          <Label htmlFor="name">Interview Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="subject">Subject</Label>
          {isLoading ? (
            <div className="flex items-center mt-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading subjects...</span>
            </div>
          ) : (
            <Select
              value={subject}
              onValueChange={setSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsList.map((subj) => (
                  <SelectItem key={subj.name} value={subj.name}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div>
          <Label>Batches</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {allDepartments.map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox
                  id={dept}
                  checked={departments.includes(dept)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDepartments([...departments, dept]);
                    } else {
                      setDepartments(departments.filter((d) => d !== dept));
                    }
                  }}
                />
                <Label htmlFor={dept}>{dept}</Label>
              </div>
            ))}
          </div>
        </div>
        
        {subject && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Select topics for {subject}</h3>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllTopics}
                  disabled={selectedSubjectTopics.length === 0}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={deselectAllTopics}
                  disabled={topics.length === 0}
                  className="text-xs"
                >
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {selectedSubjectTopics.length > 0 ? (
                  selectedSubjectTopics.map((topic) => (
                    <div 
                      key={topic}
                      onClick={() => handleTopicChange(topic, !topics.includes(topic))}
                      className={`px-3 py-2 rounded-md cursor-pointer transition-colors text-center ${
                        topics.includes(topic) 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {topic}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No topics available for this subject.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-start space-x-2 mt-6 p-3 rounded-md bg-muted/50 border border-muted">
          <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-foreground">
            Please go to <span className="font-semibold">Admin Panel &gt; Subject Topics</span> to edit subjects and topics
          </p>
        </div>
        
        <Button
          type="button"
          disabled={!isDetailsComplete}
          onClick={continueToQuestions}
          className="w-full"
        >
          Continue to Add Questions
        </Button>
      </TabsContent>

      <TabsContent value="questions" className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="predefinedQuestions">Predefined Questions (Optional)</Label>
            <span className="text-sm text-muted-foreground">{predefinedQuestions.length} questions added</span>
          </div>
          
          <div className="flex space-x-2">
            <Textarea
              id="currentQuestion"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Type a question and press Enter or Add"
              className="flex-1"
              onKeyDown={handleKeyDown}
            />
            <Button 
              type="button" 
              onClick={addPredefinedQuestion}
              disabled={!currentQuestion.trim()}
              className="self-end"
            >
              Add
            </Button>
          </div>
          
          {predefinedQuestions.length > 0 && (
            <div className="mt-4 space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              <h4 className="font-medium">Added Questions:</h4>
              {predefinedQuestions.map((question, index) => (
                <div 
                  key={index} 
                  className="flex items-start p-3 rounded-md bg-muted group hover:bg-muted/80"
                >
                  <span className="flex-1 text-sm">{question}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePredefinedQuestion(index)}
                    className="opacity-100 text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Replace the existing info div in the predefined questions tab with this updated version */}
          <div className="flex items-start mt-4 p-3 rounded-md bg-muted/50 border border-muted">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p>Adding predefined questions is optional.</p>
              <div className="mt-1 font-medium">
                <p>AI-generated questions: {preferences.questions}</p>
                <p>AI-generated coding questions: {preferences.codingQuestions}</p>
                <p>Predefined questions: {predefinedQuestions.length}</p>
                <p>Total questions: {preferences.questions + predefinedQuestions.length+preferences.codingQuestions}</p>
                <p className="mt-2 text-muted-foreground">To change the number of AI-generated questions, please go to <span className="font-semibold">Admin Panel &gt; Interview Settings</span></p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab("details")}
          >
            Back to Details
          </Button>
          
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isDetailsComplete}
          >
            Create Interview
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
