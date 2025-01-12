use crate::util::cache::{get_cached_data, set_cached_data, AppState};
use crate::util::request::{create_request, create_request_option};
use crate::util::request::{QueryOption, Response};
use crate::{cache_handler, define_request_struct, extract_headers};
use actix_web::http::StatusCode;
use actix_web::{web, HttpRequest, HttpResponse, Responder};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use serde::Deserialize;
use serde_json::{json, Value};
use std::str::FromStr;
use web::Query;

// 私信和通知接口
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/pl/count").route(web::get().to(pl_count)));
}

// 入参
define_request_struct!(PlCount, {});

impl PlCount {
    async fn requests(req: HttpRequest, query: Query<PlCount>) -> Result<Response, Value> {
        create_request(
            "/api/pl/count",
            json!({}),
            create_request_option(extract_headers!(req), &query.common, "weapi"),
        ).await
    }
}
cache_handler!(pl_count, PlCount);


// // 私信和通知接口
// const createOption = require('../util/option.js')
// module.exports = (query, request) => {
//   const data = {}
//   return request(`/api/pl/count`, data, createOption(query, 'weapi'))
// }