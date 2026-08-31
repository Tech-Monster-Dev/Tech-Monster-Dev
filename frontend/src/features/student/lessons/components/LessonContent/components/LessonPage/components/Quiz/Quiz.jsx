import { useState } from "react";

import "./Quiz.css";

export default function Quiz({
    questions = [],
}) {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    if (!Array.isArray(questions) || questions.length === 0) {
        return null;
    }

    const handleSelect = (questionIndex, option) => {
        if (submitted) return;

        setAnswers((previous) => ({
            ...previous,
            [questionIndex]: option,
        }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const handleReset = () => {
        setAnswers({});
        setSubmitted(false);
    };

    return (
        <section className="lesson-quiz">
            <div className="lesson-quiz__header">
                <span className="lesson-quiz__eyebrow">
                    KNOWLEDGE CHECK
                </span>

                <h3 className="lesson-quiz__title">
                    Quick Quiz
                </h3>
            </div>

            <div className="lesson-quiz__questions">
                {questions.map((question, questionIndex) => {
                    const selected = answers[questionIndex];
                    const correct = question.answer;

                    return (
                        <article
                            className="lesson-quiz__question"
                            key={
                                question.id ||
                                `quiz-${questionIndex}`
                            }
                        >
                            <div className="lesson-quiz__question-number">
                                Question {questionIndex + 1}
                            </div>

                            <h4 className="lesson-quiz__question-text">
                                {question.question}
                            </h4>

                            <div className="lesson-quiz__options">
                                {Array.isArray(question.options)
                                    ? question.options.map(
                                          (option, optionIndex) => {
                                              const isSelected =
                                                  selected === option;

                                              const isCorrect =
                                                  submitted &&
                                                  option === correct;

                                              const isWrong =
                                                  submitted &&
                                                  isSelected &&
                                                  option !== correct;

                                              return (
                                                  <button
                                                      type="button"
                                                      key={`${option}-${optionIndex}`}
                                                      className={[
                                                          "lesson-quiz__option",
                                                          isSelected
                                                              ? "is-selected"
                                                              : "",
                                                          isCorrect
                                                              ? "is-correct"
                                                              : "",
                                                          isWrong
                                                              ? "is-wrong"
                                                              : "",
                                                      ]
                                                          .filter(Boolean)
                                                          .join(" ")}
                                                      onClick={() =>
                                                          handleSelect(
                                                              questionIndex,
                                                              option
                                                          )
                                                      }
                                                      disabled={submitted}
                                                  >
                                                      <span className="lesson-quiz__option-marker">
                                                          {String.fromCharCode(
                                                              65 + optionIndex
                                                          )}
                                                      </span>

                                                      <span>{option}</span>
                                                  </button>
                                              );
                                          }
                                      )
                                    : null}
                            </div>

                            {submitted && selected === correct ? (
                                <div className="lesson-quiz__feedback lesson-quiz__feedback--success">
                                    {question.explanation ||
                                        "Correct answer."}
                                </div>
                            ) : null}

                            {submitted &&
                            selected &&
                            selected !== correct ? (
                                <div className="lesson-quiz__feedback lesson-quiz__feedback--error">
                                    {question.explanation ||
                                        "Review the lesson and try again."}
                                </div>
                            ) : null}
                        </article>
                    );
                })}
            </div>

            <div className="lesson-quiz__actions">
                {!submitted ? (
                    <button
                        type="button"
                        className="lesson-quiz__submit"
                        onClick={handleSubmit}
                        disabled={
                            Object.keys(answers).length !==
                            questions.length
                        }
                    >
                        Check Answers
                    </button>
                ) : (
                    <button
                        type="button"
                        className="lesson-quiz__reset"
                        onClick={handleReset}
                    >
                        Try Again
                    </button>
                )}
            </div>
        </section>
    );
}
