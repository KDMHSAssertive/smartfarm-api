module.exports = {
    res_end: (res, code, err, err_position, cont, note) => {
        res.status(code);
        if (note && process.env.NODE_ENV != "production") {
            res.json({
                data: cont,
                error: {
                    position: err_position,
                    errors: err,
                    note: note
                }
            });
        } else {
            if (process.env.NODE_ENV == "production") {
                res.json({
                    data: cont,
                    errors: err
                });
            } else {
                res.json({
                    data: cont,
                    error: {
                        position: err_position,
                        errors: err
                    }
                });
            }
        }
    }
}