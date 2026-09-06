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

            <div ref={pickerRef} className="emojiPickerWrapper">

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

                    <div className="emojiPicker">

                        <EmojiPicker
                            theme="dark"
                            width={350}
                            height={400}
                            searchDisabled={false}
                            previewConfig={{ showPreview: false }}
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

            </div>

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