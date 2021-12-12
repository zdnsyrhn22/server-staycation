const router = require('express').Router();
const adminController = require('../controllers/adminController');
const {upload, uploadMultiple} = require('../middlewares/multer');
const auth = require('../middlewares/auth')


//auth
router.get('/login', adminController.viewLogin);
router.post('/login', adminController.actionLogin);
router.use(auth.isLogin);
router.get('/logout', adminController.actionLogout);
//dashboard
router.get('/dashboard', adminController.viewDashboard);
//category
router.get('/category', adminController.viewCategory);
router.post('/category', adminController.addCategory);
router.put('/category', adminController.editCategory);
router.delete('/category/:id', adminController.deleteCategory);
//bank
router.get('/bank', adminController.viewBank);
router.post('/bank',upload, adminController.addBank);
router.put('/bank',upload, adminController.editBank);
router.delete('/bank/:id', adminController.deleteBank);
//item
router.get('/item', adminController.viewItem);
router.post('/item',uploadMultiple, adminController.addItem);
router.get('/item/show-image/:id', adminController.showImageItem);
router.get('/item/:id', adminController.showEditItem);
router.put('/item/:id',uploadMultiple, adminController.editItem);
router.delete('/item/:id/delete', adminController.deleteItem);
//detail item
router.get('/item/show-detail-item/:itemId', adminController.viewDetailItem);
//feature
router.post('/item/add/feature', upload, adminController.addFeature);
router.put('/item/update/feature', upload, adminController.editFeature);
router.delete('/item/:itemId/feature/:id', upload, adminController.deleteFeature);
//activity
router.post('/item/add/activity', upload, adminController.addActivity);
router.put('/item/update/activity', upload, adminController.editActivity);
router.delete('/item/:itemId/activity/:id', upload, adminController.deleteActivity);
//booking
router.get('/booking', adminController.viewBooking);
router.get('/booking/:id', adminController.viewDetailBooking);
router.put('/booking/:id/confirmation', adminController.actionConfirmation);
router.put('/booking/:id/reject', adminController.actionReject);

module.exports = router