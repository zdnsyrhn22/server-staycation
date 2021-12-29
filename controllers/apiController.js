const Item = require("../models/Item");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");
const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Member = require("../models/Member");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .select("_id title price city country unit imageId")
        .sort({ sumBooking: -1 })
        .populate({ path: "imageId", select: "_id imageUrl" })
        .limit(5);

      const category = await Category.find()
        .select("_id name")
        .populate({
          path: "itemId",
          select: "_id title city country unit imageId isPopular",
          perDocumentLimit: 4,
          option: { sort: { sumBooking: -1 } },
          populate: {
            path: "imageId",
            select: "_id imageUrl",
            perDocumentLimit: 1,
          },
        })
        .limit(3);

      const travelers = await Booking.find();
      const treasures = await Activity.find();
      const cities = await Item.find();

      for (let i = 0; i < category.length; i++) {
        for (let j = 0; j < category[i].itemId.length; j++) {
          const item = await Item.findOne({ _id: category[i].itemId[j]._id });
          item.isPopular = false;
          await item.save();

          if (category[i].itemId[0] === category[i].itemId[j]) {
            item.isPopular = true;
            await item.save();
          }
        }
      }

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "images/testimonial_landingPage.jpg",
        name: "Happy Family",
        rate: 3.7,
        content:
          "What a great trip with my family and I should try again next time soon ... ",
        familyName: "Udin Suhenap",
        familyOccupation: "web Development",
      };

      res.status(200).json({
        hero: {
          travelers: travelers.length,
          treasures: treasures.length,
          cities: cities.length,
        },
        mostPicked,
        category,
        testimonial,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;

      const item = await Item.findOne({ _id: id })
        .populate({ path: "featureId", select: "_id name qty imageUrl" })
        .populate({ path: "activityId", select: "_id name type imageUrl" })
        .populate({ path: "imageId", select: "_id imageUrl" });

      const bank = await Bank.find();

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "/images/testimonial_detailPage.jpg",
        name: "Happy Family",
        rate: 4.25,
        content:
          "What a great trip with my family and I should try again and again next time soon...",
        familyName: "Angga",
        familyOccupation: "UI Designer",
      };

      res.status(200).json({
        ...item._doc,
        bank,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  bookingPage: async (req, res) => {
    try {
      const {
        idItem,
        duration,
        bookingStartDate,
        bookingEndDate,
        firstName,
        lastName,
        email,
        phoneNumber,
        accountHolder,
        bankFrom,
      } = req.body;

      if (!req.file) {
        res.status(404).json({ message: "Image not Found" });
      }

      if (
        idItem === undefined ||
        duration === undefined ||
        bookingStartDate === undefined ||
        bookingEndDate === undefined ||
        firstName === undefined ||
        lastName === undefined ||
        email === undefined ||
        phoneNumber === undefined ||
        accountHolder === undefined ||
        bankFrom === undefined
      ) {
        res.status(404).json({ message: "Fields not complete" });
      }

      const item = await Item.findOne({ _id: idItem });

      if (!item) {
        res.status(404).json({ message: "Item not found" });
      } else {
        item.sumbooking += 1;
        item.save();
      }

      let total = item.price * duration;
      let tax = total * 0.1;
      let invoice = Math.floor(1000000 + Math.random() * 9000000);

      const member = await Member.create({
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      const newBooking = {
        invoice,
        bookingStartDate,
        bookingEndDate,
        total: (total += tax),
        itemId: {
          _id: item.id,
          title: item.title,
          price: item.price,
          duration: duration,
        },
        memberId: member.id,
        payments: {
          proofPayment: `images/${req.file.filename}`,
          bankFrom: bankFrom,
          accountHolder: accountHolder,
        },
      };

      const booking = await Booking.create(newBooking);

      res.status(201).json({ message: "Success", booking });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  browseByPage: async (req, res) => {
    const { sort, q } = req.query;

    function shuffle(array) {
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    }

    try {
      const items = await Item.find({ title: { $regex: q, $options: "i" } })
        .select("_id title city country categoryId price imageId sumBooking")
        .sort(
          sort === "least booking"
            ? { sumBooking: 1 }
            : sort === "most booking"
            ? { sumBooking: -1 }
            : sort === "cheapest"
            ? { price: 1 }
            : sort === "pricely"
            ? { price: -1 }
            : ""
        )
        .populate({
          path: "imageId",
          select: "_id imageUrl",
          perDocumentLimit: 1,
        });

      if (
        sort !== "least booking" &&
        sort !== "most booking" &&
        sort !== "cheapest" &&
        sort !== "pricely"
      ) {
        shuffle(items);
      }

      const sorting = [
        {
          name: 'Most Booking',
          value: 'most booking'
        },
        {
          name: 'Least Booking',
          value: 'least booking'
        },
        {
          name: 'Pricely',
          value: 'pricely'
        },
        {
          name: 'Cheapest',
          value: 'cheapest'
        },
      ]

      const heading = {
        title: "Browse By",
        subtitle: "Find a place for your staycation",
      }

      res.status(200).json({
        heading,
        sorting,
        items
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
