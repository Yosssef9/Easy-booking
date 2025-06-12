const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const { Property } = require("./models/property");
const Reservation = require("./models/reservations");
const User = require("./models/userModel");
require("dotenv").config();

async function generateRandomReservationDates() {
  const today = new Date();
  // النهاية لازم تكون قبل اليوم (expired)
  // خلينا النهاية تكون بين 1 و 30 يوم قبل اليوم
  const daysBeforeToday = faker.number.int({ min: 1, max: 30 });
  const end = new Date(today);
  end.setDate(today.getDate() - daysBeforeToday);

  // مدة الحجز من 2 إلى 5 أيام
  const days = faker.number.int({ min: 2, max: 5 });

  // البداية = النهاية - عدد الأيام
  const start = new Date(end);
  start.setDate(end.getDate() - days);

  return { start, end, days };
}

async function createFakeReservations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find();
    if (users.length === 0) {
      console.log("❌ No users found. Please seed users first.");
      return;
    }

    const properties = await Property.find().populate({
      path: "rooms.reservations reservations",
      populate: { path: "reservations" },
    });

    let count = 0;

    for (const property of properties) {
      const { start, end, days } = await generateRandomReservationDates();
      const tenant = faker.helpers.arrayElement(users);

      if (property.propertyType === "House") {
        const isAvailable = await property.isReservationAvailable(start, end);
        if (!isAvailable) continue;

        const reservation = await Reservation.create({
          propertyId: property._id,
          propertyType: "House",
          reservationStartDate: start,
          reservationEndDate: end,
          numberOfReservationDays: days,
          isTheReservationOver: true,
          tenant: tenant._id,
        });

        property.reservations.push(reservation._id);
        await property.save();
        count++;
        await User.findByIdAndUpdate(
          tenant._id,
          { $addToSet: { reservedProperties: property._id } },
          { new: true }
        );
        console.log(
          `Added property ${property._id} to user ${tenant._id} reservedProperties`
        );
      } else if (property.propertyType === "Hotel") {
        const availableRooms = await property.getAvailableRoom(
          start,
          end,
          "all"
        );
        if (!availableRooms || availableRooms.length === 0) continue;

        const room = faker.helpers.arrayElement(availableRooms);

        const reservation = await Reservation.create({
          propertyId: property._id,
          propertyType: "Hotel",
          reservationStartDate: start,
          reservationEndDate: end,
          numberOfReservationDays: days,
          isTheReservationOver: true,
          tenant: tenant._id,
        });

        const targetRoom = property.rooms.find(
          (r) => r._id.toString() === room._id.toString()
        );
        if (targetRoom) {
          targetRoom.reservations.push(reservation._id);
        }

        await property.save();
        count++;
        await User.findByIdAndUpdate(
          tenant._id,
          { $addToSet: { reservedProperties: property._id } },
          { new: true }
        );
        // console.log(
        //   `Added property ${property._id} to user ${tenant._id} reservedProperties`
        // );
      }
    }

    console.log(`✅ Created ${count} fake reservations.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating fake reservations:", error);
    await mongoose.disconnect();
  }
}

createFakeReservations();
