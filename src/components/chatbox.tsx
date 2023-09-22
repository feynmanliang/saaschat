import { Message } from '~/types';
import MessageUI from './message';
import { createSignal } from 'solid-js';

type ChatboxProps = {
    messageSending: boolean,
    messages: Message[],
    sendMessage: (m: string) => void
};

export default function Chatbox(props: ChatboxProps) {
    const [text, setText] = createSignal("");

    return (
        <div class="chat-container">
            <div class="messages-box">
                {props.messages.map(m => <MessageUI message={m} />)}
            </div>
            <input
                class="chat-input"
                placeholder="send message"
                onInput={e => {
                    setText(e.target.value);
                }}
            />
            {props.messageSending
                ?
                <span class="loading loading-spinner loading-lg"></span>
                : <button class="btn btn-active btn-primary" onClick={() => {
                    props.sendMessage(text());
                }}>send</button>
            }
        </div>
    );
}