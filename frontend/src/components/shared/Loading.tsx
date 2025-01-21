import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const LoadingModal = ({
    isOpen,
    message,
  }: {
    isOpen: boolean;
    message?: string;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-xl z-10 flex flex-col items-center"
          >
            <Loader2 className="h-8 w-8 animate-spin text-gray-800 mb-4" />
            <p className="text-gray-800 font-semibold">
              {message || "Saving changes..."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );