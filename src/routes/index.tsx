import Chatbox from '~/components/chatbox';
// import sendChatMessage from '~/lib/sendChatMessage';
import { askQuestionOrMakeInitialRecommendation, refineList } from '~/lib/openai';
import { Message } from '~/types';
import { createSignal } from 'solid-js';
import Recs, { Rec } from '~/components/recommendations';


export default function Home() {
  const [messageSending, setMessageSending] = createSignal(false);
  const [messages, setMessages] = createSignal([]);
  const [recs, setRecs] = createSignal([]);

  const sendMessage = async (t: string) => {
    setMessageSending(true);
    const newMessages = [...messages(), { role: 'user', content: t }];
    setMessages(newMessages);


    const products = (await import('~/data.json')).default;

    if (recs && recs().length) {
      const x = await refineList(newMessages, recs());
      setMessageSending(false);
      const res = JSON.parse(x.data).map(d => {
        const product = products.find(x => x.id == d.id - 1);
        return {
          name: product.name,
          // name: d.name,
          rank: d.rating,
          logo: product.Image,
          pros: d.Pros,
          cons: d.Cons,
        };
      })
      setRecs(res);
      const resp = {
        content: "Sure. Here are my revised recommendations.",
        role: 'assistant'
      };
      setMessages([...messages(), resp]);
    } else {
      askQuestionOrMakeInitialRecommendation(newMessages)
        .then(x => {
          console.log(x);
          setMessageSending(false);
          switch (x.type) {
            case 'recs':
              const res = JSON.parse(x.data).map(d => {
                const product = products.find(x => x.id == d.id - 1);
                return {
                  name: product.name,
                  // name: d.name,
                  rank: d.rating,
                  logo: product.Image,
                  pros: d.Pros,
                  cons: d.Cons,
                };
              })
              setRecs(res);
              const resp = {
                content: "Sure. Here are some of my recommendations.",
                role: 'assistant'
              };
              setMessages([...messages(), resp]);
              break;

            case 'error':
              alert(x.data);
              break;

            case 'clarification':
              const asstResponse = {
                content: x.data,
                role: 'assistant'
              };
              const msgWithAst = [...messages(), asstResponse];
              setMessages(msgWithAst);
              break;

            default:
              return;
          }

        });
    }
  };

  const clearRec = (r: Rec) => {
    console.log(r);
  };

  return (
    <main class="flex flex-row">
      <Chatbox
        messages={messages() as Message[]}
        sendMessage={sendMessage}
        messageSending={messageSending()}
      />
      <Recs recs={recs()} onClear={clearRec} />
    </main>
  );
}