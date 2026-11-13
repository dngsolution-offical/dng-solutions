import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(express.json());

const client = new Anthropic();

const plans = {
  basic:    { model: "claude-haiku-5-5",  max_tokens: 500 },
  gold:     { model: "claude-haiku-5-5",  max_tokens: 1000 },
  diamond:  { model: "claude-sonnet-5-5", max_tokens: 2000 },
  infinity: { model: "claude-sonnet-5-5", max_tokens: 4000 },
};

const agents = {
  business: "შენ ხარ DNG Solutions-ის ბიზნეს-ასისტენტი. დაეხმარე მომხმარებელს ბიზნესის დაგეგმვაში, მარკეტინგსა და ყოველდღიურ საქმიანობაში. უპასუხე ქართულად, კონკრეტულად.",
  support: "შენ ხარ DNG Solutions-ის მხარდაჭერის აგენტი. უპასუხე ქართულად, მოკლედ და თავაზიანად.",
};

app.post("/api/chat", async (req, res) => {
  try {
    const { agent = "business", messages } = req.body;
    const plan = plans.basic;
    const response = await client.messages.create({
      model: plan.model,
      max_tokens: plan.max_tokens,
      system: agents[agent] ?? agents.business,
      messages,
    });
    res.json({ text: response.content[0].text });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log("Server: http://localhost:3001"));
