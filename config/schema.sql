-- Chatbots
drop table if exists chatbots;
create table chatbots (
  id                    bigint(20)          not null auto_increment     comment 'SYSTEM ID',
  chatbot_id            varchar(256)        not null                    comment 'Chatbot ID',
  name                  varchar(128)        not null                    comment 'Chatbot Name',
  created_at            datetime                                        comment 'Chatbot Creation Time',
  primary key (id)
) engine=innodb auto_increment=100 comment = 'Chatbot Information Form';;