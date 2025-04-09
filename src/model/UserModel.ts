import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: Date;
  friends: mongoose.Types.ObjectId[]; // list of friend user IDs
  refreshToken: string | null;
  isPasswordMatch(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.toJSON = function () {
  const newUser = this.toObject();
  delete newUser.password;
  delete newUser.refreshToken;
  return newUser;
};

userSchema.methods.isPasswordMatch = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
