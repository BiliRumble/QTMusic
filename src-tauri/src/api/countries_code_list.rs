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

// // 国家编码列表
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/countries/code/list").route(web::get().to(countries_code_list)));
}

// 入参
define_request_struct!(CountriesCodeList, {
   
});

impl CountriesCodeList {
    async fn requests(req: HttpRequest, query: Query<CountriesCodeList>) -> Result<Response, Value> {
        let data = json!({});
        create_request(
            "/api/lbs/countries/v1",
            data,
            create_request_option(extract_headers!(req), &query.common, ""),
        ).await
    }
}
cache_handler!(countries_code_list, CountriesCodeList);


// // 国家编码列表
// const createOption = require('../util/option.js')
// module.exports = (query, request) => {
//   const data = {}
//   return request(`/api/lbs/countries/v1`, data, createOption(query))
// }