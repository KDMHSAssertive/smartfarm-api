let server_mode = "development";
module.exports = {
    res_end: (res, code, err, err_position, cont, note) => {
        res.status(code);
        if (note && server_mode == "development") {
            res.json({
                data: cont,
                error: {
                    position: err_position,
                    errors: err,
                    note: note
                }
            });
        } else {
            if (server_mode == "development") {
                res.json({
                    data: cont,
                    error: {
                        position: err_position,
                        errors: err
                    }
                });
            } else if (server_mode == "service") {
                res.json({
                    data: cont,
                    errors: err
                });
            }
        }
    }
}