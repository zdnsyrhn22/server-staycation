exports.isLogin = (req, res, next) => {
    if(req.session.user == null || req.session.user == undefined){
        res.redirect('/admin/login');
    }else{
        next();
    }
} 