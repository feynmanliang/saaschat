import { Message } from '~/types';

type MessageProps = {
    message: Message
};
export default function MessageUI({ message }: MessageProps) {
    const location = message.role === 'user' ? 'chat-start' : 'chat-end';
    return (
        <div class={`chat ${location}`}>
            <div class="chat-bubble">{message.content}</div>
        </div>
    );
}