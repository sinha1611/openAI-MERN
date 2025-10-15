import { GoogleGenAI } from "@google/genai";
import { Promt } from "../model/promt.model.js";

const openai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
export const sendPromt = async (req, res) => {
  const { content } = req.body;
  const userId = req.userId;

  if (!content || content.trim() === "") {
    return res.status(400).json({ errors: "Promt content is required" });
  }
  try {
    const uniqueId = Date.now();
    // save user promt
    const userPromt = await Promt.create({
      userId,
      role: "user",
      content,
      uniqueId
    });

    const completion = await openai.models.generateContent({
      model: "gemini-2.5-flash",
      messages: [
        { role: "user", content: content }],
      contents: content
    });
    // console.log("completion", completion.text)
    const aiContent = completion.text;

    // save assistant promt
    const aiMessage = await Promt.create({
      userId,
      role: "assistant",
      content: aiContent,
      uniqueId
    });
    return res.status(200).json({ reply: aiContent });
  } catch (error) {
    console.log("Error in Promt: ", error);
    return res
      .status(500)
      .json({ error: "Something went wrong with the AI response" });
  }
};

export const getPromt = async (req, res) => {
  const { content } = req.body;
  const userId = req.userId;
  try {
    const user_promt = await Promt.find({ userId });
    
    return res.status(200).json({ promts: user_promt.filter(item => item.role == "user") });
  } catch (error) {
    console.log("Error in Promt: ", error);
    return res
      .status(500)
      .json({ error: "Something went wrong with the AI response" });
  }
};

export const deletePromt = async (req, res) => {
  const promtId = req.body.promt_id;
  const userId = req.body.userId;
  try {
    const delete_promt = await Promt.findByIdAndDelete({_id: promtId });
    const user_promt = await Promt.find({ userId });
    return res.status(200).json({ promts: user_promt.filter(item => item.role == "user") });
  } catch (error) {
    console.log("Error in Promt: ", error);
    return res
      .status(500)
      .json({ error: "Something went wrong with the AI response" });
  }
};

export const createdPromt = async (req, res) => {
  const uniqueId = req.body.uniqueId;
  try {
    const created_promt = await Promt.find({uniqueId });
    const response = created_promt.map(item => ({role: item.role, content: item.content}))
    console.log("response", response)
    return res.status(200).json({ promts: response });
  } catch (error) {
    console.log("Error in Promt: ", error);
    return res
      .status(500)
      .json({ error: "Something went wrong with the AI response" });
  }
};
