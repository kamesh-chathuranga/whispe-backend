import { Request, Response } from "express";

const getAllUserMessages = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params;
    // const messages = await prisma.message.findMany({
    //   where: {
    //     OR: [
    //       {
    //         authorId: from,
    //         receiverId: to,
    //       },
    //       {
    //         authorId: to,
    //         receiverId: from,
    //       },
    //     ],
    //   },
    //   orderBy: {
    //     id: "asc",
    //   },
    // });

    // const unreadMessages = messages
    //   .filter((message) => message.status !== "read" && message.authorId === to)
    //   .map((message) => message.id);

    // await prisma.message.updateMany({
    //   where: {
    //     id: {
    //       in: unreadMessages,
    //     },
    //   },
    //   data: {
    //     status: "read",
    //   },
    // });

    // return res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

export default {
  getAllUserMessages,
};
