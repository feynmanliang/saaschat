import type { Message } from '~/types'
import OpenAI from 'openai';
import { products } from './knowledgeBase';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    organization: import.meta.env.VITE_OPENAI_ORGANIZATION,
    dangerouslyAllowBrowser: true,
})

export async function askQuestionOrMakeInitialRecommendation(conversation: Message[]) {
    // let products = (await import('~/data.json')).default;

    const openAiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content:
                    `You are an assistant who takes product requirements from a user and suggests the best product to choose out of for the user use case. If you do not have a recommendation ask the user for clarifying questions. Ask clarifying questions till you have completely nailed down the user needs. Only choose the products that fit in the use case.  Once you have a recommendation choose out of these products:
                    <products>
                    ${products}
                    </products>`,
            },

            ...conversation
        ],
        functions: [
            {
                name: 'askUserClarifyingQuestion',
                description:
                    'Select this function if you still have clarifying questions to ask the user.',
                parameters: {
                    type: 'object',
                    properties: {
                        clarifyingQuestion: {
                            type: 'string',
                            description:
                                'Clarifying question for the user to understand their use case better',
                        },
                    },
                }
            },
            {
                name: 'makeRecommendations',
                description:
                    'Select this function when you have a good idea about the user use case and want to make a recommendation. Fill in the parameters using the product attributes from the system message. Do not make anything up.',
                parameters: {
                    type: 'object',
                    properties: {
                        response: {
                            type: 'string',
                            description: 'your response to the user alongside your initial recommendations',
                        },
                        productList: {
                            type: 'array',
                            description: 'an array of products and their recommendations for the user',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {
                                        type: 'integer',
                                        description: 'Id of the product from the list of products provided'
                                    },
                                    name: {
                                        type: 'string',
                                        description: 'Name of the product'
                                    },
                                    rating: {
                                        type: 'string',
                                        description: 'Product recommendation rating out of 5'
                                    },
                                    Pros: {
                                        type: 'string',
                                        description: 'What are pros of choosing this product for the users situation'
                                    },
                                    Cons: {
                                        type: 'string',
                                        description: 'What are cons of choosing this product for the users situation'
                                    },
                                },
                            },
                        },
                    },
                },
            }
        ],
        function_call: 'auto',
    });

    // if its a function call, JSON.parse it 
    const message = openAiResponse.choices[0].message
    if (message.function_call) {
        if (message.function_call.name === 'askUserClarifyingQuestion') {
            return { type: 'clarification', data: JSON.parse(message.function_call.arguments).clarifyingQuestion };
        } else if (message.function_call.name === 'makeRecommendations') {
            return { type: 'recs', data: JSON.stringify(JSON.parse(message.function_call.arguments).productList), response: JSON.parse(message.function_call.arguments).response };
        } else {
            return { type: 'error', data: message.function_call };
        }
    } else {
        return { type: 'clarification', data: message.content };
    };
}

export async function refineList(chunk: string, recommendations: string) {
    console.log(products)
    const openAiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content:
                    `You are an assistant who takes product requirements from a user and suggests the best product to choose out of for the user use case. You will be given a list of conversation history where you have made recommendations earlier. Given these recommendations the user wants to update the list of recommendations. Your job is to help them do that. Based on the recommendations your job is to update the recommendations based on your user history and the new request and return the updated list of recommendations.

                    Here are the recommendations you provided:
                    
                    <current recommendations>
                    ${recommendations}.                    
                    </current recommendations>

                    Here are the products available:

                    <products>
                    ${products}
                    </products>
                    
                    Current conversation
                    <conversation>
                    ${chunk}
                    </conversation>
                    `,
            },
            {
                role: 'user',
                content: `User conversation about their use case ${chunk}`,
            },
        ],
        functions: [
            {
                name: 'updateRecommendations',
                description:
                    'This function should update the recommendations for the product pertaining to the user use case based on the user request. Fill in the parameters using the product attributes from the system message. Do not make anything up.',
                parameters: {
                    type: 'object',
                    properties: {
                        response: {
                            type: 'string',
                            description: 'your response to the user alongside your updated recommendations',
                        },
                        productList: {
                            type: 'array',
                            description: 'an updated array of products and their recommendations for the user',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {
                                        type: 'string',
                                        description: 'Id of the product from the list of products provided'
                                    },
                                    name: {
                                        type: 'string',
                                        description: 'Name of the product'
                                    },
                                    rating: {
                                        type: 'string',
                                        description: 'Product recommendation rating out of 5'
                                    },
                                    Pros: {
                                        type: 'string',
                                        description: 'What are pros of choosing this product for the users situation'
                                    },
                                    Cons: {
                                        type: 'string',
                                        description: 'What are cons of choosing this product for the users situation'
                                    },
                                },
                            },
                        },
                    },
                }
            }
        ],
        function_call: { name: 'updateRecommendations' },
    });
    console.log(openAiResponse)

    // if its a function call, JSON.parse it 
    const message = openAiResponse.choices[0].message;
    if (message.function_call) {
        return { type: 'recs', data: JSON.stringify(JSON.parse(message.function_call.arguments).productList), response: JSON.parse(message.function_call.arguments).response };
    } else {
        return { type: 'error', data: message };
    }
}