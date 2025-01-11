
use crate::util::cache::{get_cached_data, set_cached_data, AppState};
use crate::util::request::{create_request, create_request_option};
use crate::util::request::{QueryOption, Response};
use crate::{cache_handler, define_request_struct, extract_headers};
use actix_web::http::StatusCode;
use actix_web::{web, HttpRequest, HttpResponse, Responder};
use serde::Deserialize;
use serde_json::{json, Value};
use web::Query;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use std::str::FromStr;



pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/yunbei/sign").route(web::get().to(yunbei_sign)));
}

define_request_struct!(YunbeiSign, {});

impl YunbeiSign {
    async fn requests(req: HttpRequest, query: Query<YunbeiSign>) -> Result<Response, Value> {
        let data = json!({});
        create_request(
            "/api/pointmall/user/sign",
            data,
            create_request_option(extract_headers!(req), &query.common, "weapi"),
        ).await
    }
}
cache_handler!(yunbei_sign, YunbeiSign);


// const createOption = require('../util/option.js')
// module.exports = (query, request) => {
//   const data = {}
//   return request(`/api/pointmall/user/sign`, data, createOption(query, 'weapi'))
// }