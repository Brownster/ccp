
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UsageReviewModal } from './UsageReviewModal';

export function UsageWizardModal({ resources, onFinish }) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingUsage, setPendingUsage] = useState(null);

  useEffect(() => {
    const fetchWizard = async () => {
      setLoading(true);
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + '/usage-wizard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resources }),
        });
        const data = await response.json();
        setQuestions(data.questions || []);
        setAnswers(Array(data.questions.length).fill(''));
      } catch (err) {
        console.error('Failed to fetch usage wizard:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (resources?.length) fetchWizard();
  }, [resources]);

  const handleNext = () => {
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      onFinish({ answers });
      setOpen(false);
    }
  };

  const updateAnswer = (value) => {
    const updated = [...answers];
    updated[step] = value;
    setAnswers(updated);
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usage Wizard</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Scanning your infrastructure... putting on my thinking hat!</p>
        ) : questions.length > 0 ? (
          <div>
            <p className="font-semibold mb-2">Q{step + 1}: {questions[step]}</p>
            <input
              className="w-full border rounded p-2 mb-4"
              placeholder="Your answer"
              value={answers[step] || ''}
              onChange={(e) => updateAnswer(e.target.value)}
            />
            <Button onClick={handleNext}>Next</Button>
          </div>
        ) : (
          <p>No questions needed! You're all set.</p>
        )}
  {pendingUsage && (
          <UsageReviewModal usageData={pendingUsage} onConfirm={(confirmed) => {
            if (confirmed) {
              onFinish({ usage: pendingUsage });
              setOpen(false);
            } else {
              setPendingUsage(null);
              setOpen(false);
            }
          }} />
        )}
    </DialogContent>
    </Dialog>
  );
}
