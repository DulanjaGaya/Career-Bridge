import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

const createBlankQuestion = (seed) => ({
    id: `${Date.now()}-${seed}-${Math.random().toString(36).slice(2, 8)}`,
    prompt: '',
    description: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
});

const sanitizeQuestion = (question) => ({
    prompt: question.prompt.trim(),
    description: question.description.trim(),
    options: question.options.map((option) => option.trim()),
    correctAnswer: question.options[question.correctAnswerIndex]?.trim() || '',
});

const InterviewQuestionEditor = ({ isOpen, initialQuestions = [], onClose, onSave }) => {
    const [questions, setQuestions] = useState([createBlankQuestion(0)]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (initialQuestions.length > 0) {
            setQuestions(
                initialQuestions.map((question, index) => ({
                    id: `${question.id || question._id || 'question'}-${index}`,
                    prompt: question.prompt || question.title || '',
                    description: question.description || '',
                    options: Array.isArray(question.options) ? [...question.options, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
                    correctAnswerIndex: Math.max(
                        0,
                        Array.isArray(question.options)
                            ? Math.max(0, question.options.findIndex((option) => option === question.correctAnswer))
                            : 0,
                    ),
                })),
            );
        } else {
            setQuestions([createBlankQuestion(0)]);
        }

        setError('');
    }, [initialQuestions, isOpen]);

    const updateQuestion = (index, field, value) => {
        setQuestions((currentQuestions) => currentQuestions.map((question, questionIndex) => (
            questionIndex === index ? { ...question, [field]: value } : question
        )));
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        setQuestions((currentQuestions) => currentQuestions.map((question, index) => {
            if (index !== questionIndex) {
                return question;
            }

            const nextOptions = [...question.options];
            nextOptions[optionIndex] = value;
            return { ...question, options: nextOptions };
        }));
    };

    const addQuestion = () => {
        setQuestions((currentQuestions) => [...currentQuestions, createBlankQuestion(currentQuestions.length)]);
    };

    const removeQuestion = (index) => {
        setQuestions((currentQuestions) => {
            if (currentQuestions.length === 1) {
                return currentQuestions;
            }

            return currentQuestions.filter((_, questionIndex) => questionIndex !== index);
        });
    };

    const handleSave = () => {
        const normalizedQuestions = questions.map(sanitizeQuestion);

        for (let index = 0; index < normalizedQuestions.length; index += 1) {
            const question = normalizedQuestions[index];

            if (!question.prompt) {
                setError(`Question ${index + 1} needs a prompt.`);
                return;
            }

            if (question.options.some((option) => !option)) {
                setError(`Question ${index + 1} must have 4 filled options.`);
                return;
            }

            if (new Set(question.options).size !== question.options.length) {
                setError(`Question ${index + 1} options must be unique.`);
                return;
            }

            if (!question.correctAnswer) {
                setError(`Question ${index + 1} needs a correct answer.`);
                return;
            }
        }

        setError('');
        onSave(normalizedQuestions);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-brand-border px-6 py-4 bg-brand-bg/60">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">Interview question editor</p>
                        <h2 className="mt-1 text-2xl font-bold text-brand-text">Build the lobby interview set</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-brand-border bg-brand-bg p-2 text-brand-muted transition-colors hover:text-brand-text"
                        aria-label="Close question editor"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-130px)] overflow-y-auto px-6 py-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-brand-muted">Add the interview questions that will appear inside this lobby.</p>
                            <p className="mt-1 text-sm font-medium text-brand-text">{questions.length} question{questions.length === 1 ? '' : 's'} added</p>
                        </div>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="inline-flex items-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20"
                        >
                            <Plus size={16} />
                            Add question
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        {questions.map((question, questionIndex) => (
                            <div key={question.id} className="rounded-2xl border border-brand-border bg-brand-bg/40 p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Question {questionIndex + 1}</p>
                                        <h3 className="mt-1 text-lg font-bold text-brand-text">Interview prompt</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(questionIndex)}
                                        disabled={questions.length === 1}
                                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Trash2 size={16} />
                                        Remove
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-brand-text">Prompt</label>
                                        <textarea
                                            value={question.prompt}
                                            onChange={(event) => updateQuestion(questionIndex, 'prompt', event.target.value)}
                                            rows="3"
                                            className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-brand-text outline-none transition-colors placeholder:text-brand-muted/50 focus:border-brand-primary"
                                            placeholder="Enter the interview question"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-brand-text">Description</label>
                                        <textarea
                                            value={question.description}
                                            onChange={(event) => updateQuestion(questionIndex, 'description', event.target.value)}
                                            rows="2"
                                            className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-brand-text outline-none transition-colors placeholder:text-brand-muted/50 focus:border-brand-primary"
                                            placeholder="Optional context or hint"
                                        />
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label className="block text-sm font-medium text-brand-text">Four answer choices</label>
                                            <span className="text-xs text-brand-muted">Mark the correct answer with the selector below</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={`${question.id}-option-${optionIndex}`} className="space-y-2 rounded-xl border border-brand-border bg-brand-surface p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
                                                            Option {String.fromCharCode(65 + optionIndex)}
                                                        </label>
                                                        <label className="inline-flex items-center gap-2 text-xs font-medium text-brand-text">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${question.id}`}
                                                                checked={question.correctAnswerIndex === optionIndex}
                                                                onChange={() => updateQuestion(questionIndex, 'correctAnswerIndex', optionIndex)}
                                                                className="h-4 w-4 accent-brand-primary"
                                                            />
                                                            Correct
                                                        </label>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                                                        className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-brand-text outline-none transition-colors placeholder:text-brand-muted/50 focus:border-brand-primary"
                                                        placeholder={`Answer choice ${String.fromCharCode(65 + optionIndex)}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-brand-border px-6 py-4 bg-brand-bg/60">
                    <p className="text-sm text-brand-muted">Each question needs exactly 4 unique options and one correct answer.</p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-brand-border bg-brand-surface px-5 py-2.5 text-sm font-semibold text-brand-text transition-colors hover:border-brand-primary/40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-xl border border-brand-primaryHover bg-gradient-to-r from-brand-primary to-brand-primaryHover px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
                        >
                            Save questions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewQuestionEditor;