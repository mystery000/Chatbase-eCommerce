-- Chatbots
drop table if exists chatbots;
create table chatbots (
  id                    bigint(20)          not null auto_increment     comment 'SYSTEM ID',
  chatbot_id            varchar(128)        not null                    comment 'Chatbot ID',
  name                  varchar(128)        not null                    comment 'Chatbot Name',
  created_at            datetime                                        comment 'Chatbot Creation Time',
  promptTemplate        text                                            comment 'Prompt Template',
  model                 varchar(30)         not null                    comment 'Model',
  temperature           smallint            not null default 0          comment 'Temperature',
  visibility            varchar(30)         not null default 'public'   comment 'Private: No one can access your chatbot except you. Public: Anyone with the link can access it on chatbase.co and can be embedded on your website. Public: Anyone with the link can access it on chatbase.co and can be embedded on yoru website.',
  ip_limit              int(10)             not null default 20         comment 'Limit the number of messages sent from one device on the iframe and chat bubble',
  ip_limit_message      varchar(512)                                    comment 'Show this message to show when limit is hit',
  ip_limit_timeframe    int(10)             not null default 240        comment 'Limit time period',
  initial_messages      text                                            comment 'Initial messages',
  chatbot_icon          varchar(256)                                    comment 'Chatbot icon',
  profile_icon          varchar(256)                                    comment 'Profile icon',       
  contact_info          text                not null                    comment 'Contact Information',
  primary key (id)
) engine=innodb auto_increment=100 comment = 'Chatbot Information Form';

drop table if exists sources;
create table sources (
  id                    bigint(20)          not null auto_increment     comment 'SYSTEM ID',
  chatbot_id            varchar(128)        not null                    comment 'Chatbot ID',
  type                  varchar(30)         not null                    comment 'Source Type: File, Crawl, Sitemap, Text',
  content               varchar(256)        not null                    comment 'Source content',
  size                  bigint(15)          not null                    comment 'characters size',
  primary key (id)
) engine=innodb auto_increment=100 comment = 'Sources Information Form';