import { useRef, useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

import {
    HiPaperAirplane,
    HiEmojiHappy
} from "react-icons/hi";


import "./ChatInput.css";

export default function ChatInput({

    text,

    setText,

    handleSend

}) {

    const pickerRef = useRef();

    const [showEmoji, setShowEmoji] = useState(false);

    useEffect(() => {

        const close = (e) => {

            if (

                pickerRef.current &&

                !pickerRef.current.contains(

                    e.target

                )

            ) {

                setShowEmoji(false);

            }

        };

        document.addEventListener(

            "click",

            close

        );

        return () =>

            document.removeEventListener(

                "click",

                close

            );

    }, []);

    return (

        <div className="chatInputContainer">

            <button

                className="chatIconBtn"

                onClick={() =>

                    setShowEmoji(!showEmoji)

                }

            >

                <HiEmojiHappy />

            </button>

            {

                showEmoji && (

                    <div ref={pickerRef} className="emojiPicker">

                        <EmojiPicker

                            onEmojiClick={(emoji) =>

                                setText(

                                    prev =>

                                        prev + emoji.emoji

                                )

                            }

                        />

                    </div>

                )

            }

            <input

                className="chatTextInput"

                type="text"

                placeholder="Type your message..."

                value={text}

                onChange={(e) =>

                    setText(

                        e.target.value

                    )

                }

                onKeyDown={(e) => {

                    if (e.key === "Enter") {

                        handleSend();

                    }

                }}

            />

            <button

                className="sendBtn"

                onClick={handleSend}

            >

                <HiPaperAirplane />

            </button>

        </div>

    );

}