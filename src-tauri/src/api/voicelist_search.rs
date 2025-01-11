
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

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/voicelist/search").route(web::get().to(voicelist_search)));
}

// 入参
define_request_struct!(VoicelistSearch, {
  limit: Option<String>,
  offset: Option<String>,
  podcastName: Option<String>
});


impl VoicelistSearch {
    async fn requests(req: HttpRequest, query: Query<VoicelistSearch>) -> Result<Response, Value> {
        let data = json!({
            "fee": "-1",
            "limit": query.limit.clone().unwrap_or("200".to_string()),
            "offset": query.offset.clone().unwrap_or("0".to_string()),
            "podcastName": query.podcastName.clone().unwrap_or_default()
        });
        create_request(
            "/api/voice/workbench/voicelist/search",
            data,
            create_request_option(extract_headers!(req), &query.common, "weapi"),
        ).await
    }
}
cache_handler!(voicelist_search, VoicelistSearch);



// const createOption = require('../util/option.js')
// module.exports = (query, request) => {
//   const data = {
//     fee: '-1',
//     limit: query.limit || '200',
//     offset: query.offset || '0',
//     podcastName: query.podcastName || '',
//   }
//   return request(
//     `/api/voice/workbench/voicelist/search`,
//     data,
//     createOption(query),
//   )
// }