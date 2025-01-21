import { getAllDepartments } from "@/Communicators/apiCommunications";
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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const subjects = ["JavaScript", "Python", "Java", "C++", "Ruby"];

export function CreateInterviewCard({
  onCreateInterview,
}: {
  onCreateInterview: (newInterview: {
    name: string;
    subject: string;
    department: string;
    topic: string;
  }) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);

  useEffect(() => {
    getAllDepartments().then((res) => {
      const departments = res.map((department: { name: string }) => department.name);
      setAllDepartments(departments);
    });
  }, []);

  const handleCreateInterview = (newInterview: {
    name: string;
    subject: string;
    department: string;
    topic: string;
  }) => {
    onCreateInterview(newInterview);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Interview
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Interview</DialogTitle>
        </DialogHeader>
        <CreateInterviewForm
          onSubmit={handleCreateInterview}
          allDepartments={allDepartments}
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
  }) => void;
  allDepartments: string[];
}

function CreateInterviewForm({ onSubmit, allDepartments }: CreateInterviewFormProps) {
  const [name, setName] = useState("");
  // Replace multiple subjects with a single subject input
  const [subject, setSubject] = useState("");
  // Modify departments to handle multiple selections
  const [departments, setDepartments] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (name && subject && departments.length > 0 && topics.length > 0) {
      onSubmit({
        name,
        subject,
        department: departments.join(", "),
        topic: topics.join(", "),
      });

      setName("");
      setSubject("");
      setDepartments([]);
      setTopics([]);
    }
  };

  const addTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic("");
    }
  };

  const handleTopicKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter((topic) => topic !== topicToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Departments</Label>
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
      {/* {subjects.map((subject) => (
            <div key={subject} className="flex items-center space-x-2">
              <Checkbox
                id={subject}
                checked={selectedSubjects.includes(subject)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSubjects([...selectedSubjects, subject]);
                  } else {
                    setSelectedSubjects(
                      selectedSubjects.filter((s) => s !== subject)
                    );
                  }
                }}
              />
              <label htmlFor={subject}>{subject}</label>
            </div>
          ))} */}
      <div className="space-y-2">
        <Label htmlFor="topic">Topics</Label>
        <div className="flex gap-2">
          <Input
            id="topic"
            value={currentTopic}
            onChange={(e) => setCurrentTopic(e.target.value)}
            onKeyPress={handleTopicKeyPress}
            placeholder="Enter a topic"
          />
          <Button
            type="button"
            onClick={addTopic}
            disabled={!currentTopic.trim()}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {topics.map((topic) => (
            <div
              key={topic}
              className="bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-2"
            >
              <span>{topic}</span>
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      <Button
        type="submit"
        disabled={
          !name ||
          !subject ||
          departments.length === 0 ||
          topics.length === 0
        }
      >
        Create Interview
      </Button>
    </form>
  );
}
