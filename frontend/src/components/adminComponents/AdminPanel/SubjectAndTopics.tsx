import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  addSubject, 
  addSubtopicToSubject, 
  deleteSubject, 
  deleteSubtopicFromSubject,
  getSubjects, 
  updateSubjectName 
} from "@/Communicators/apiCommunications";
import toast from "react-hot-toast";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  }
};

// SubjectCard component
const SubjectCard = ({ subject, isEditing, onSave, onDelete, onEdit, newSubjects = [] }) => {
  const [name, setName] = useState(subject.name || "");
  const [topics, setTopics] = useState(subject.topics || subject.subtopics || []);
  const [newTopic, setNewTopic] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Track the original name and topics for comparison
  const [originalName] = useState(subject.name || "");
  const [originalTopics] = useState([...(subject.topics || subject.subtopics || [])]);

  const handleAddTopic = (e) => {
    if (e.key === "Enter" && newTopic.trim()) {
      if (!topics.includes(newTopic.trim())) {
        setTopics([...topics, newTopic.trim()]);
      }
      setNewTopic("");
      e.preventDefault();
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Subject name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      // If it's a new subject
      if (newSubjects.includes(subject.id)) {
        // Create the subject first
        await addSubject(name);
        
        // Add each topic one by one
        for (const topic of topics) {
          try {
            await addSubtopicToSubject(name, topic);
          } catch (error) {
            console.log(`Failed to add topic ${topic}:`, error);
            // Continue with other topics even if one fails
          }
        }
      } 
      // If it's an existing subject being updated
      else {
        // If the name has changed, update the subject name
        if (originalName !== name) {
          await updateSubjectName(originalName, name);
        }
        
        // Find topics to add and remove
        const topicsToAdd = topics.filter(topic => !originalTopics.includes(topic));
        const topicsToRemove = originalTopics.filter(topic => !topics.includes(topic));
        
        // Add new topics
        for (const topic of topicsToAdd) {
          try {
            await addSubtopicToSubject(name, topic);
          } catch (error) {
            console.log(`Topic ${topic} might already exist:`, error);
          }
        }
        
        // Remove deleted topics
        for (const topic of topicsToRemove) {
          try {
            await deleteSubtopicFromSubject(name, topic);
          } catch (error) {
            console.log(`Failed to delete topic ${topic}:`, error);
          }
        }
      }
      
      onSave({ ...subject, name, topics });
      toast.success(`Subject ${newSubjects.includes(subject.id) ? 'created' : 'updated'} successfully`);
    } catch (error: any) {
      // Special handling for "Subject already exists" error
      if (error.message === 'Subject already exists') {
        // Error is already handled by the toast in the communicator
      } else {
        console.error("Error saving subject:", error);
        toast.error("An error occurred while saving the subject");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRightClick = (e) => {
    if (!isEditing) {
      e.preventDefault();
      onEdit(subject.id);
    }
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      onEdit(subject.id);
    }
  };  
  
  const handleDeleteSubject = async () => {
    if (newSubjects.includes(subject.id)) {
      // If it's a new subject that hasn't been saved yet, just remove it from UI
      onDelete(subject.id);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteSubject(subject.name);
      onDelete(subject.id);
    } catch (error) {
      console.error("Error deleting subject:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full"
    >      
      <Card 
        className="hover:shadow-lg transition-shadow duration-300 flex flex-col relative group cursor-pointer"
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
        title={!isEditing ? "Double-click or right-click to edit" : ""}
      >
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600"
            onClick={handleDeleteSubject}
            title="Delete subject"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-5 w-5" />}
          </Button>
        )}
        <CardHeader className="pb-2">
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subject Name"
              className="text-lg font-normal"
            />
          ) : (
            <CardTitle>{name}</CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          {isEditing && (
            <div className="mb-4">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={handleAddTopic}
                placeholder="Add topic and press Enter"
                className="mb-2"
              />
            </div>
          )}
          <div className="flex flex-wrap">
            <AnimatePresence>
              {topics.map((topic, index) => (
                <motion.div
                  key={`${topic}-${index}`}
                  layout
                  variants={tagVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mr-2 mb-2"
                >
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {topic}
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveTopic(topic)}
                        className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-between">
            {newSubjects.includes(subject.id) ? (
              <>
                <Button variant="outline" onClick={() => onDelete(subject.id)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteSubject}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export const SubjectsAndTopics = () => {
  const [subjects, setSubjects] = useState([]);
  const [editingSubjects, setEditingSubjects] = useState([]);
  const [newSubjects, setNewSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch subjects on component mount
  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const data = await getSubjects();
      // Check if data has the expected format and provide fallbacks if not
      const subjectsArray = data.subjects || [];
      
      // Transform the data to match our component's expected format
      const transformedSubjects = subjectsArray.map((subject, index) => ({
        id: index + 1,
        name: subject.name,
        topics: subject.subtopics || []
      }));
      setSubjects(transformedSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
      // Set empty subjects array on error
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSubjects();
  }, []);
  
  const addNewSubject = () => {
    const newSubject = { 
      id: Date.now(), 
      name: "", 
      topics: [] 
    };
    setSubjects([...subjects, newSubject]);
    setEditingSubjects([...editingSubjects, newSubject.id]);
    setNewSubjects([...newSubjects, newSubject.id]);
  };

  const startEditing = (subjectId) => {
    setEditingSubjects([...editingSubjects, subjectId]);
  };
  
  const saveSubject = async (updatedSubject) => {
    setSubjects(subjects.map(subject => 
      subject.id === updatedSubject.id ? updatedSubject : subject
    ));
    setEditingSubjects(editingSubjects.filter(id => id !== updatedSubject.id));
    setNewSubjects(newSubjects.filter(id => id !== updatedSubject.id));
    
    // Refresh the subject list to ensure we have the latest data
    await fetchSubjects();
  };

  const deleteSubject = async (subjectId) => {
    setSubjects(subjects.filter(subject => subject.id !== subjectId));
    setEditingSubjects(editingSubjects.filter(id => id !== subjectId));
    setNewSubjects(newSubjects.filter(id => id !== subjectId));
    
    // Refresh the subject list after deletion
    await fetchSubjects();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Subject Topics</h2>
        <Button onClick={addNewSubject} className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading subjects...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-auto">
          <AnimatePresence>
            {subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isEditing={editingSubjects.includes(subject.id)}
                onSave={saveSubject}
                onDelete={deleteSubject}
                onEdit={startEditing}
                newSubjects={newSubjects}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};