const Users = require("../models/Users");

const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Item = require("../models/Item");
const Image = require("../models/Image");
const Feature = require("../models/Feature");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");
const Member = require("../models/Member");

const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcryptjs");

//auth
exports.viewLogin = (req, res) => {
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    if (req.session.user == null || req.session.user == undefined) {
      res.render("index", {
        title: "Staycation | Login",
        alert,
      });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    res.redirect("/admin/login");
  }
};

exports.actionLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Users.findOne({ username: username });

    if (!user) {
      req.flash(
        "alertMessage",
        "The email address or mobile number you entered isn't connected to an account."
      );
      req.flash("alertStatus", "danger");

      res.redirect("/admin/login");
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      req.flash(
        "alertMessage",
        "The password that you've entered is incorrect."
      );
      req.flash("alertStatus", "danger");

      res.redirect("/admin/login");
    }

    req.session.user = {
      id: user.id,
      username: user.username,
    };

    res.redirect("/admin/dashboard");
  } catch (error) {
    res.redirect("/admin/login");
  }
};

exports.actionLogout = async (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
};

//dashboard
exports.viewDashboard = async (req, res) => {
  const category = await Category.find();
  const booking = await Booking.find();
  const item = await Item.find();
  const member = await Member.find();

  try {
    res.render("admin/dashboard/view_dashboard", {
      title: "Dashboard",
      user: req.session.user,
      category,
      booking,
      item,
      member,
    });
  } catch (error) {
    res.redirect("/admin/dashboard");
  }
};

//category
exports.viewCategory = async (req, res) => {
  try {
    const category = await Category.find();
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    res.render("admin/category/view_category", {
      title: "Category",
      category,
      alert,
    });
  } catch (error) {
    res.redirect("/admin/category");
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    await Category.create({ name });

    req.flash("alertMessage", "Success Add Category");
    req.flash("alertStatus", "success");

    res.redirect("/admin/category");
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/category");
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { id, name } = req.body;
    await Category.findByIdAndUpdate(id, { name: name });

    req.flash("alertMessage", "Success Updated Category");
    req.flash("alertStatus", "warning");

    res.redirect("/admin/category");
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/category");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndRemove(id);

    req.flash("alertMessage", "Success Deleted Category");
    req.flash("alertStatus", "danger");

    res.redirect("/admin/category");
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/category");
  }
};

//bank
exports.viewBank = async (req, res) => {
  try {
    const bank = await Bank.find();
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    res.render("admin/bank/view_bank", {
      title: "Bank",
      bank,
      alert,
    });
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/bank");
  }
};

exports.addBank = async (req, res) => {
  try {
    const { bankName, accountNumber, name } = req.body;
    await Bank.create({
      bankName,
      accountNumber,
      name,
      imageUrl: `images/${req.file.filename}`,
    });
    req.flash("alertMessage", "Success Add Bank");
    req.flash("alertStatus", "success");

    res.redirect("/admin/bank");
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/bank");
  }
};

exports.editBank = async (req, res) => {
  try {
    const { id, bankName, accountNumber, name } = req.body;
    const bank = await Bank.findOne({ _id: id });
    if (req.file == undefined) {
      bank.bankName = bankName;
      bank.accountNumber = accountNumber;
      bank.name = name;
      await bank.save();

      req.flash("alertMessage", "Success Updated Bank");
      req.flash("alertStatus", "warning");
      res.redirect("/admin/bank");
    } else {
      await fs.unlink(path.join(`public/${bank.imageUrl}`));
      bank.bankName = bankName;
      bank.accountNumber = accountNumber;
      bank.name = name;
      bank.imageUrl = `images/${req.file.filename}`;
      await bank.save();

      req.flash("alertMessage", "Success Updated Bank");
      req.flash("alertStatus", "warning");
      res.redirect("/admin/bank");
    }
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/bank");
  }
};

exports.deleteBank = async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await Bank.findOne({ _id: id });
    await fs.unlink(path.join(`public/${bank.imageUrl}`));
    await bank.remove();

    req.flash("alertMessage", "Success Deleted Bank");
    req.flash("alertStatus", "danger");

    res.redirect("/admin/bank");
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/bank");
  }
};

//item
exports.viewItem = async (req, res) => {
  try {
    const item = await Item.find()
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });

    const category = await Category.find();
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    res.render("admin/item/view_item", {
      title: "Item",
      category,
      alert,
      item,
      action: "view",
    });
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/item");
  }
};

exports.addItem = async (req, res) => {
  try {
    const { title, city, price, categoryId, description } = req.body;

    if (req.files.length > 0) {
      const category = await Category.findOne({ _id: categoryId });
      const newItem = {
        title,
        city,
        price,
        categoryId: category._id,
        sumBooking: 0,
        description,
        unit: "night",
      };

      const item = await Item.create(newItem);
      category.itemId.push({ _id: item._id });
      await category.save();

      for (let i = 0; i < req.files.length; i++) {
        const imageSave = await Image.create({
          imageUrl: `images/${req.files[i].filename}`,
        });
        item.imageId.push({ _id: imageSave._id });
        await item.save();
      }
      req.flash("alertMessage", "Success Add Item");
      req.flash("alertStatus", "success");

      res.redirect("/admin/item");
    }
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/item");
  }
};

exports.showImageItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findOne({ _id: id }).populate({
      path: "imageId",
      select: "id imageUrl",
    });

    res.render("admin/item/view_item", {
      title: "Item",
      item,
      action: "show image",
    });
  } catch (error) {
    res.redirect("/admin/item");
  }
};

exports.showEditItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findOne({ _id: id })
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });

    const category = await Category.find();

    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    res.render("admin/item/view_item", {
      title: "Edit Item",
      item,
      alert,
      category,
      action: "edit",
    });
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/item");
  }
};

exports.editItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, city, price, categoryId, description } = req.body;

    const item = await Item.findOne({ _id: id })
      .populate({ path: "imageId", select: "id imageUrl" })
      .populate({ path: "categoryId", select: "id name" });

    if (req.files.length > 0) {
      for (let i = 0; i < item.imageId.length; i++) {
        const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id });
        await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
        imageUpdate.imageUrl = `images/${req.files[i].filename}`;
        await imageUpdate.save();
      }
      item.title = title;
      item.price = price;
      item.city = city;
      item.categoryId = categoryId;
      item.description = description;
      await item.save();
      req.flash("alertMessage", "Success Update Item");
      req.flash("alertStatus", "success");

      res.redirect("/admin/item");
    } else {
      item.title = title;
      item.price = price;
      item.city = city;
      item.categoryId = categoryId;
      item.description = description;
      await item.save();
      req.flash("alertMessage", "Success Update Item");
      req.flash("alertStatus", "warning");

      res.redirect("/admin/item");
    }
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/item");
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id }).populate("imageId");

    for (let i = 0; i < item.imageId.length; i++) {
      Image.findOne({ _id: item.imageId[i]._id })
        .then((image) => {
          fs.unlink(path.join(`public/${image.imageUrl}`));
          image.remove();

          req.flash("alertMessage", "Success Delete Item");
          req.flash("alertStatus", "danger");

          res.redirect("/admin/item");
        })
        .catch((error) => {
          req.flash("alertMessage", `${error.message}`);
          req.flash("alertStatus", "danger");

          res.redirect("/admin/item");
        });
    }
    await item.remove();
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect("/admin/item");
  }
};

//detail item
exports.viewDetailItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    const feature = await Feature.find({ itemId: itemId });
    const activity = await Activity.find({ itemId: itemId });

    res.render("admin/item/detail_item/view_detail_item", {
      title: "Detail Item",
      alert,
      itemId,
      feature,
      activity,
    });
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  }
};

//feature
exports.addFeature = async (req, res) => {
  try {
    const { name, qty, itemId } = req.body;
    if (!req.file) {
      req.flash("alertMessage", `Image not found`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
    const feature = await Feature.create({
      name,
      qty,
      itemId,
      imageUrl: `images/${req.file.filename}`,
    });

    const item = await Item.findOne({ _id: itemId });
    item.featureId.push({ _id: feature._id });
    await item.save();

    req.flash("alertMessage", "Success Add Feature");
    req.flash("alertStatus", "success");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  }
};

exports.editFeature = async (req, res) => {
  const { id, name, qty, itemId } = req.body;
  try {
    const feature = await Feature.findOne({ _id: id });
    if (req.file == undefined) {
      feature.name = name;
      feature.qty = qty;
      await feature.save();

      req.flash("alertMessage", "Success Updated Feature");
      req.flash("alertStatus", "warning");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } else {
      await fs.unlink(path.join(`public/${feature.imageUrl}`));
      feature.name = name;
      feature.qty = qty;
      feature.imageUrl = `images/${req.file.filename}`;
      await feature.save();

      req.flash("alertMessage", "Success Updated Feature");
      req.flash("alertStatus", "warning");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  }
};

exports.deleteFeature = async (req, res) => {
  const { id, itemId } = req.params;
  try {
    const feature = await Feature.findOne({ _id: id });
    const item = await Item.findOne({ _id: itemId }).populate("featureId");
    for (let i = 0; i <= item.featureId.length; i++) {
      if (item.featureId[i]._id.toString() === feature._id.toString()) {
        item.featureId.pull({ _id: feature._id });
        await item.save();
      }
    }
    await fs.unlink(path.join(`public/${feature.imageUrl}`));
    await feature.remove();

    req.flash("alertMessage", "Success Deleted Feature");
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  }
};

exports.addActivity = async (req, res) => {
  const { name, type, itemId } = req.body;
  try {
    if (!req.file) {
      req.flash("alertMessage", `Image not found`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
    const activity = await Activity.create({
      name,
      type,
      itemId,
      imageUrl: `images/${req.file.filename}`,
    });

    const item = await Item.findOne({ _id: itemId });
    item.activityId.push({ _id: activity._id });
    await item.save();

    req.flash("alertMessage", "Success Add Activity");
    req.flash("alertStatus", "success");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  }
};

//activity
exports.editActivity = async (req, res) => {
  const { id, name, type, itemId } = req.body;
  try {
    const activity = await Activity.findOne({ _id: id });
    if (req.file == undefined) {
      activity.name = name;
      activity.type = type;
      await activity.save();

      req.flash("alertMessage", "Success Updated Activity");
      req.flash("alertStatus", "warning");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    } else {
      await fs.unlink(path.join(`public/${activity.imageUrl}`));
      activity.name = name;
      activity.type = type;
      activity.imageUrl = `images/${req.file.filename}`;
      await activity.save();

      req.flash("alertMessage", "Success Updated Activity");
      req.flash("alertStatus", "warning");
      res.redirect(`/admin/item/show-detail-item/${itemId}`);
    }
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  }
};

exports.deleteActivity = async (req, res) => {
  const { id, itemId } = req.params;
  try {
    const activity = await Activity.findOne({ _id: id });
    const item = await Item.findOne({ _id: itemId }).populate("activityId");
    for (let i = 0; i <= item.activityId.length; i++) {
      if (item.activityId[i]._id.toString() === activity._id.toString()) {
        item.activityId.pull({ _id: activity._id });
        await item.save();
      }
    }
    await fs.unlink(path.join(`public/${activity.imageUrl}`));
    await activity.remove();

    req.flash("alertMessage", "Success Deleted Activity");
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");

    res.redirect(`/admin/item/show-detail-item/${itemId}`);
  }
};

//booking
exports.viewBooking = async (req, res) => {
  try {
    const booking = await Booking.find()
      .populate("memberId")
      .populate("bankId");

    res.render("admin/booking/view_booking", {
      title: "Booking",
      booking,
    });
  } catch (error) {
    res.redirect("/admin/booking");
  }
};

exports.viewDetailBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findOne({ _id: id }).populate("memberId");

    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    res.render("admin/booking/detail_booking", {
      title: "Detail Booking",
      booking,
      alert,
    });
  } catch (error) {
    res.redirect("/admin/booking");
  }
};

exports.actionConfirmation = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findOne({ _id: id });
    booking.payments.status = "Accept";
    await booking.save();

    req.flash("alertMessage", "Success Confirmation Payment");
    req.flash("alertStatus", "success");

    res.redirect(`/admin/booking/${id}`);
  } catch (error) {
    res.redirect(`/admin/booking/${id}`);
  }
};

exports.actionReject = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findOne({ _id: id });
    booking.payments.status = "Reject";
    await booking.save();

    req.flash("alertMessage", "Success Reject Payment");
    req.flash("alertStatus", "success");

    res.redirect(`/admin/booking/${id}`);
  } catch (error) {
    res.redirect(`/admin/booking/${id}`);
  }
};
