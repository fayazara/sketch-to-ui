import OpenAI from "openai";
export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().openaiApiKey
  if (!apiKey) throw new Error("Missing OpenAI API key")
  const openai = new OpenAI();

  const systemPrompt = `You are an expert web developer who specializes in tailwind css.\nA user will provide you with a low-fidelity wireframe of an application.\nYou will return a single html file that uses HTML, tailwind css, and JavaScript to create a high fidelity website.\nInclude any extra CSS and JavaScript in the html file.\nIf you have any images, load them from Unsplash or use solid colored rectangles.\nThe user will provide you with notes in blue or red text, arrows, or drawings.\nThe user may also include images of other websites as style references. Transfer the styles as best as you can, matching fonts / colors / layouts.\nThey may also provide you with the html of a previous design that they want you to iterate from.\nCarry out any changes they request from you.\nIn the wireframe, the previous design's html will appear as a white rectangle.\nFor your reference, all text from the image will also be provided to you as a list of strings, separated by newlines. Use them as a reference if any text is hard to read.\nUse creative license to make the application more fleshed out.\nUse JavaScript modules and unpkg to import any necessary dependencies.\n\nRespond ONLY with the contents of the html file.`;

  const generatePayload = (text, imageUrl) => {
    return [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
          {
            type: "text",
            text: "Turn this into a single html file using tailwind."
          },
          {
            type: "text",
            text: "No previous design has been provided this time."
          },
          {
            type: "text",
            text: text,
          },
        ],
      },
    ];
  }
  return defineEventHandler(async event => {
    const { text, imageUrl } = await readBody(event);
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 4096,
      temperature: 0,
      messages: generatePayload(text, imageUrl),
    })
    const htmlContent = response.choices[0].message.content.match(/```html\n([\s\S]*?)\n```/)[1];
    return htmlContent;
  })
})
