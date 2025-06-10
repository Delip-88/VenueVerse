// import mongoose from "mongoose";
// import Booking from "./models/Booking.js";

// async function updateAllBookings() {
//     try {
//         const mongoUri = "mongodb+srv://theDeveloper:bjL9V8eSStWqlx2C@tester.hjvx0.mongodb.net/Organizer?retryWrites=true&w=majority&appName=Tester";

//         await mongoose.connect(mongoUri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         const result = await Booking.updateMany(
//             {}, // match all documents
//             {
//                 $set: {
//                     eventType: "WEDDING",
                    
//                 },
//             }
//         );

//         console.log(`${result.modifiedCount} bookings updated.`);
//     } catch (err) {
//         console.error("Error updating bookings:", err);
//     } finally {
//         await mongoose.disconnect();
//     }
// }

// updateAllBookings();


// import mongoose from "mongoose";
// import User from "./models/user.js";

// async function updateCOmpany() {
//     try {
//         const mongoUri = "mongodb+srv://theDeveloper:bjL9V8eSStWqlx2C@tester.hjvx0.mongodb.net/Organizer?retryWrites=true&w=majority&appName=Tester";

//         await mongoose.connect(mongoUri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         const result = await User.updateMany(
//             {}, // match all documents
//             {
//                 $set: {
//                     companyName: "Awesome Company",
                    
//                 },
//             }
//         );

//         console.log(`${result.modifiedCount} bookings updated.`);
//     } catch (err) {
//         console.error("Error updating bookings:", err);
//     } finally {
//         await mongoose.disconnect();
//     }
// }

// updateCOmpany();



// import mongoose from "mongoose";
// import User from "./models/user.js";

// async function updateCOmpany() {
//     try {
//         const mongoUri = "mongodb+srv://theDeveloper:bjL9V8eSStWqlx2C@tester.hjvx0.mongodb.net/Organizer?retryWrites=true&w=majority&appName=Tester";

//         await mongoose.connect(mongoUri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         const result = await User.updateMany(
//             {}, // match all documents
//             {
//                 $set: {
//                     phone: "9863232323",
//                     address: "Kathmandu, Nepal",
//                     esewaId: "9863232323",
                    
//                 },
//             }
//         );

//         console.log(`${result.modifiedCount} bookings updated.`);
//     } catch (err) {
//         console.error("Error updating bookings:", err);
//     } finally {
//         await mongoose.disconnect();
//     }
// }

// updateCOmpany();


// import mongoose from "mongoose";
// import User from "./models/user.js";

// async function updateCOmpany() {
//     try {
//         const mongoUri = "mongodb+srv://theDeveloper:bjL9V8eSStWqlx2C@tester.hjvx0.mongodb.net/Organizer?retryWrites=true&w=majority&appName=Tester";

//         await mongoose.connect(mongoUri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         const result = await User.updateMany(
//             {}, // match all documents
//             {
//                 $set: {
//                     submittedAt: new Date(), // Set submittedAt to current date
                  
                    
//                 },
//             }
//         );

//         console.log(`${result.modifiedCount} bookings updated.`);
//     } catch (err) {
//         console.error("Error updating bookings:", err);
//     } finally {
//         await mongoose.disconnect();
//     }
// }

// updateCOmpany();
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categories: [String]
});

const Categories = mongoose.model("Categories", categorySchema);

async function createCategoriesCollection() {
    try {
        const mongoUri = "mongodb+srv://theDeveloper:bjL9V8eSStWqlx2C@tester.hjvx0.mongodb.net/Organizer?retryWrites=true&w=majority&appName=Tester";

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const categoriesData = {
            categories: [
                "WEDDING",
                "CONFERENCE_HALL",
                "PARTY_HALL",
                "BANQUET",
                "OUTDOOR",
                "MEETING_ROOM",
                "SEMINAR_HALL",
                "CONCERT_HALL",
                "EXHIBITION_CENTER",
                "THEATER",
                "SPORTS_ARENA",
                "RESORT",
                "GARDEN",
                "CLUBHOUSE",
                "ROOFTOP",
                "RESTAURANT",
                "AUDITORIUM",
                "BEACH_VENUE",
                "CONVENTION_CENTER",
                "TRAINING_CENTER",
                "COWORKING_SPACE",
                "PRIVATE_VILLA",
                "CORPORATE_EVENT_SPACE",
            ]
        };

        // Insert the document into the collection
        const result = await Categories.create(categoriesData);

        console.log("Categories collection created with data:", result);
    } catch (err) {
        console.error("Error creating categories collection:", err);
    } finally {
        await mongoose.disconnect();
    }
}

createCategoriesCollection();
