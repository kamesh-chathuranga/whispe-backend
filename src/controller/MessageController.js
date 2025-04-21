"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllUserMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to get messages" });
    }
});
exports.default = {
    getAllUserMessages,
};
