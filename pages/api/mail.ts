import type { NextApiRequest, NextApiResponse } from "next";
// import sgMail from "@sendgrid/mail";
import SparkPost from "sparkpost";

const client = new SparkPost(process.env.SPARKPOST_API_KEY || "");

// sgMail.setApiKey(process.env.SPARKPOST_API_KEY || "");

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const {
      name,
      email,
      message,
    }: { name: string; email: string; message: string } = req.body;
    const msg = `Name: ${name}\r\n Email: ${email}\r\n Message: ${message}`;
    // const data = {
    //   to: process.env.MAIL_TO as string,
    //   from: process.env.MAIL_FROM as string,
    //   subject: `${name.toUpperCase()} sent you a message from Portfolio`,
    //   text: `Email => ${email}`,
    //   html: msg.replace(/\r\n/g, "<br>"),
    // };
    const data = {
      // options: {
      //   sandbox: false,
      // },
      content: {
        from: { email: process.env.MAIL_FROM as string },
        subject: `${name.toUpperCase()} sent you a message from Portfolio`,
        html: msg.replace(/\r\n/g, "<br>"),
      },
      recipients: [{ address: process.env.MAIL_TO as string }],
    };
    //Modified to use SparkPost
    try {
      await client.transmissions.send(data);
      //   await sgMail.send(data);
      res.status(200).json({ message: "Your message was sent successfully." });
    } catch (err) {
      res
        .status(500)
        .json({ message: `There was an error sending your message. ${err}` });
    }
  }
}
