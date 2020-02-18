let server_mode = "development";
module.exports = {
    res_end: (res, code, err, err_position, cont, note) => {
        if (note && server_mode == "development") {
            res.json({
                status: code,
                contents: cont,
                error: {
                    position: err_position,
                    errors: err,
                    note: note
                }
            });
        } else {
            if (server_mode == "development") {
                res.json({
                    status: code,
                    contents: cont,
                    error: {
                        position: err_position,
                        errors: err
                    }
                });
            } else if (server_mode == "service") {
                res.json({
                    status: code,
                    contents: cont,
                    errors: err
                });
            }
        }
    }
}