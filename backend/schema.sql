create table if not exists users(
  name text primary key,
  bcryptPassword text not null,
  level int not null default 1 /* 1=user 5=maintainer 9=owner */
);

insert or replace into users(name,bcryptPassword,level) values(
  'admin',
  '$2b$12$9BwyzrkCBioedc6.YLh6xO8jWpHfMeN6hrguMR7qAY7m8CSGrt8Si', /* admin */
  9
);
insert or replace into users(name,bcryptPassword,level) values(
  'user',
  '$2b$12$aSC4i0puHmBhEOPdm/ocKOJD4Se3KiajWMznvdx4vN.p./yEWfuee', /* user */
  1
);


create table if not exists beers(
  id integer primary key,
  name text not null,
  percentage float not null,
  brewery text not null,
  category text not null
);

insert or replace into beers(id,name,percentage,brewery,category) values(1, 'Willy Tonka', 11.0, 'De Moersleutel', 'Imperial Stout');
insert or replace into beers(id,name,percentage,brewery,category) values(2, 'Punk IPA', 5.6, 'BrewDog', 'India Pale Ale');
insert or replace into beers(id,name,percentage,brewery,category) values(3, 'Tactical Nuclear Penguin', 32.0, 'BrewDog', 'Imperial Stout');
insert or replace into beers(id,name,percentage,brewery,category) values(4, 'Zwarte Snor', 11.0, 'Berghoeve Brouwerij', 'Imperial Stout');


create table if not exists likes(
  userName text not null,
  beerId int not null,
  primary key(userName,beerId)
);

insert or replace into likes(userName,beerId) values('user', 1);
insert or replace into likes(userName,beerId) values('user', 2);
