import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./models/Service.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const defaultServices = [
  {
    name: "Catering",
    image: {
      public_id: "services/okdwumdpchj5bg4kqv4c",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674284/services/okdwumdpchj5bg4kqv4c.jpg",
    },
  },
  {
    name: "DJ",
    image: {
      public_id: "services/zz0wptfxvcecur5kj75y",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674285/services/zz0wptfxvcecur5kj75y.jpg",
    },
  },
  {
    name: "Decoration",
    image: {
      public_id: "services/dqelzgpymwwd6ie0urcw",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674284/services/dqelzgpymwwd6ie0urcw.jpg",
    },
  },
  {
    name: "Photography",
    image: {
      public_id: "services/wxweqoy6t8x03cxfwmbe",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674285/services/wxweqoy6t8x03cxfwmbe.jpg",
    },
  },
  {
    name: "Videography",
    image: {
      public_id: "services/na0a66xtkqq6v4xim480",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674285/services/na0a66xtkqq6v4xim480.jpg",
    },
  },
  {
    name: "Live Music Band",
    image: {
      public_id: "services/apgt78kxnpa36kgmy17g",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674285/services/apgt78kxnpa36kgmy17g.jpg",
    },
  },
  {
    name: "Lighting",
    image: {
      public_id: "services/cntpadn9ljki8cz2fqzw",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674285/services/cntpadn9ljki8cz2fqzw.jpg",
    },
  },
  {
    name: "Flower Arrangement",
    image: {
      public_id: "services/rfhbloqzjfanml3igxk7",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674285/services/rfhbloqzjfanml3igxk7.jpg",
    },
  },
  {
    name: "Security",
    image: {
      public_id: "services/ovityihozqmo7sbjocvu",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674286/services/ovityihozqmo7sbjocvu.jpg",
    },
  },
  {
    name: "Cleaning Service",
    image: {
      public_id: "services/qav2dhn8whztbu87uutd",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674284/services/qav2dhn8whztbu87uutd.jpg",
    },
  },
  {
    name: "Fireworks & Special Effects",
    image: {
      public_id: "services/sxxkeoznnmwduelwn8rp",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674284/services/sxxkeoznnmwduelwn8rp.jpg",
    },
  },
  {
    name: "Bridal Makeup & Styling",
    image: {
      public_id: "services/qgbqy7vk78zdhiya2s2q",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674284/services/qgbqy7vk78zdhiya2s2q.jpg",
    },
  },
  {
    name: "Car Rental (Luxury Cars)",
    image: {
      public_id: "services/i3ajrruckxp0xgccd9bb",
      secure_url:
        "https://res.cloudinary.com/dduky37gb/image/upload/v1741674284/services/i3ajrruckxp0xgccd9bb.jpg",
    },
  },
];

const seedServices = async () => {
  try {
    await Service.insertMany(defaultServices);
    console.log("✅ Default services added!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error inserting services:", error);
    mongoose.connection.close();
  }
};

seedServices();
