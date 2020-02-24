 ==UserScript==
 @name         Travel Tools
 @namespace    httptampermonkey.net
 @version      0.1
 @description  Making Traveling in Torn fun again
 @author       Luke
 @match        httpswww.torn.com
 @grant        GM_addStyle
 @grant        GM.setValue
 @grant        GM.getValue
 ==UserScript==

const api_key = PC8cWQ4qgyaN2JNh;
let user_id = ;
let company_id = ;
let faction_id = ;

(function() {
    'use strict';

    $(document).ready(function() {
        if ($(.travelling).length){

            fetch_user_company_faction();
            remove_laptop_frame();
            add_menu_bar();

            if(window.location.href.includes(torn.comcompanies.php)){
                console.log(your company page);
                build_company_page(0, Job);
            }
            else if(window.location.href.includes(joblist.php#p=corpinfo&ID=)){
                console.log(a company page);
                let company_id = window.location.href.split(joblist.php#p=corpinfo&ID=)[1];
                build_company_page(company_id, Job Listing);
            }
            else if(window.location.href.includes(factions.phpstep=profile&ID=)){
                console.log(a faction page);
                let faction_id = window.location.href.split(factions.phpstep=profile&ID=)[1];
                build_faction_page(faction_id, Faction);
            }
            else if(window.location.href.includes(torn.comfactions.php)){
                console.log(your faction page);
                build_faction_page(0, My Faction);
            }
            else if(window.location.href.includes(torn.comitem.php)){
                console.log(item page);
            }

            console.log(TEST);
        }
    });

})();

function fetch_user_company_faction(){
            (async () = {
                user_id = await GM.getValue(user_id);
                if (user_id == undefined) {
                    let url = httpsapi.torn.comuserselections=&key=+api_key;
                    apiCall(url, function(d) {
                        console.log(d);
                        GM.setValue(user_id, d.player_id);
                    });
                }
                console.log(user_id);
            })();

}

function build_faction_page(faction_id, header_text){
    $(#skip-to-content)[0].innerText = header_text;
    $(.info-msg-cont).remove();
    let url = httpsapi.torn.comfaction+faction_id+selections=&key=+api_key;
    apiCall(url, function(d) {
        let faction = d;
        console.log(faction);
        let faction_leader = ;
        let faction_leader_id = faction.leader;
        let faction_co_leader = None;
        let faction_co_leader_id = faction[co-leader];


        let faction_members = table id='employee-table'trthMembersththDays in FactionththStatusththLast Seenthtr;
        let members = faction.members;
        for (var prop in members) {
                    if (Object.prototype.hasOwnProperty.call(members, prop)) {
                        let mem = members[prop];
                        if (prop == faction_leader_id) {
                            faction_leader = mem.name;
                        } else if (prop == faction_co_leader_id) {
                            faction_co_leader = mem.name;
                        }
                        faction_members += trtddiv class='user-link'a href='profiles.phpXID=+prop+'+mem.name+adivtdtd+mem.days_in_faction+tdtd+mem.status.description+tdtd+mem.last_action.relative+tdtr;
                    }
                }
        faction_members += table;

        let faction_details =table id='company-table'trth+faction.name+ththtr;
        faction_details += trthththLeader a href='profiles.phpXID=+faction_leader_id+'+faction_leader+athtr;
        faction_details += trthththCo-Leader a href='profiles.phpXID=+faction_co_leader_id+'+faction_co_leader+athtr;
        faction_details += trthththMembers +Object.keys(faction.members).length+thtr;
        faction_details += trthththBest Chain +format_number(faction.best_chain)+thtr;
        faction_details += trthththRespect +format_number(faction.respect)+thtr;
        faction_details += trthththAge +age_decoder(faction.age)+thtrtable;

        $(#mainContainer).append(brbrdiv id='company-details' class='company-divs'+faction_details+divbrbrdiv id='company-employees' class='company-divs'+faction_members+div);

    });
}


function build_company_page(company_id, header_text){
    $(#skip-to-content)[0].innerText = header_text;
    $(.info-msg-cont).remove();

    let url = httpsapi.torn.comcompany+company_id+selections=&key=+api_key;
    apiCall(url, function(d) {
        let company = d.company;
        console.log(company);
        let company_type = Unknown;
        if(company.company_type  company_types.length){
            company_type = company_types[company.company_type];
        }
        let company_director = Unknown;

        let company_employees = table id='employee-table'trth+company.employees_hired+  +company.employees_capacity+ Company EmployeesththJob TitleththDays in CompanyththStatusththLast Seenthtr;
        let employees = company.employees;
        for (var prop in employees) {
                    if (Object.prototype.hasOwnProperty.call(employees, prop)) {
                        let emp = employees[prop];
                        if (emp.position == Director) {
                            company_director = emp.name;
                        }
                        company_employees += trtddiv class='user-link'a href='profiles.phpXID=+prop+'+emp.name+adivtdtd+emp.position+tdtd+emp.days_in_company+tdtd+emp.status.state+tdtd+emp.last_action.relative+tdtr;
                    }
                }
        company_employees += table;

        let company_details =table id='company-table'trthDetails of +company.name+ - +company_type+ththththtr;
        company_details += trthththStars +company.rating+  10ththDaily Income $+format_number(company.daily_profit)+thtr;
        company_details += trthththType +company_type+ththWeekly Income $+format_number(company.weekly_profit)+thtr;
        company_details += trthththDirector +company_director+ththDaily Customers +format_number(company.daily_customers)+thtr;
        company_details += trthththAge +age_decoder(company.days_old)+ththWeekly Customers +format_number(company.weekly_customers)+thtrtable;

        $(#mainContainer).append(brbrdiv id='company-details'+company_details+divbrbrdiv id='company-employees'+company_employees+div);
    });
}

function apiCall(url, cb){
    $.ajax({
        url url,
        type 'GET',
        success function(data) {
            cb(data);
        }
    });
}

function age_decoder(age){
    return +Math.floor(age365)+ years, +Math.floor((age%365)31)+ months;
}
function format_number(num) {
  return num.toString().replace((d)(=(d{3})+(!d))g, '$1,')
}

function remove_laptop_frame(){
    $(.computer-top-frame).remove();
    $(.computer-left-frame).remove();
    $(.computer-right-frame).remove();
    $(.computer-bottom-frame).remove();
    $(.computer-navigation).remove();
    $(.scroll-element_outer).remove();
    $(.computer-frame-wrap).removeClass( computer-frame-wrap );
}

function add_menu_bar(){
    let super_laptop_menu = $( .header-wrapper-bottom ).clone().insertAfter( .header-wrapper-bottom );
    $( .header-wrapper-bottom ).last().append(div id='super-laptop-menu'div);

    $(#super-laptop-menu).append(a href='index.php'div class='sl-menu-button'Flight Pagediva +
                                   a href='messages.php'div class='sl-menu-button'Messagesdiva +
                                   a href='events.php'div class='sl-menu-button'Eventsdiva +
                                   a href='companies.php'div class='sl-menu-button'Jobdiva +
                                   a href='factions.php'div class='sl-menu-button'Factiondiva +
                                   a href='stockexchange.php'div class='sl-menu-button'Stock Marketdiva +
                                   a href='newspaper.php'div class='sl-menu-button'Newspaperdiva +
                                   a href='forums.php'div class='sl-menu-button'Forumsdiva +
                                   a href='forums.php#p=forums&f=62'div class='sl-menu-button'Community Eventsdiva +
                                   a href='halloffame.php'div class='sl-menu-button'Hall of Famediva +
                                   a href='friendlist.php'div class='sl-menu-button'Friendsdiva +
                                   a href='blacklist.php'div class='sl-menu-button'Enemiesdiva +
                                   a href='personalstats.php'div class='sl-menu-button'Personal Statsdiva);
}


const company_types = [,
                     Hair Salon, 1
                     Law Firm, 2
                     Flower Shop, 3
                     Car Dealership, 4
                     Clothing Store, 5
                     Gun Shop, 6
                     Game Shop, 7
                     Candle Shop, 8
                     Toy Shop, 9
                     Adult Novelties, 10
                     Cyber Cafe, 11
                     Grocery Store, 12
                     Theater, 13
                     Sweet Shop, 14
                     Cruise Line, 15
                     Television Network, 16
                     , 17
                     Zoo, 18
                      Firework Stand, 19
                      Property Broker, 20
                      Furniture Store, 21
                      Gas Station, 22
                      Music Store, 23
                      Night Club, 24
                      Pub, 25
                      Gents Strip Club, 26
                      Restaurant, 27
                      Oil Rig, 28
                      Fitness Center, 29
                      Mechanic Shop, 30
                      Amusement Park, 31
                      Lingerie Store, 32
                      Meat Warehouse, 33
                      Farm, 34,
                      Software Corporation, 35
                      Ladies Strip Club, 36
                      Private Security Firm, 37
                      Mining Corporation, 38
                      Detective Agency, 39
                      Logistics Management 40
                     ]

var styles=`
#super-laptop-menu {
  background-color rgba(0,0,0,0.6);
  display flex;
}

.sl-menu-button {
  padding 9px;
  margin-right 9px;
  background-color rgba(0,0,0,0.5);
  color silver;
  font-family Lucida Console;
  cursor pointer;
}

#employee-table {
  width100%;
  background-color rgba(242,242,242);
}

#employee-table th {
  padding 8px;
  width 20%;
  text-align left;
  background-color rgba(46,46,46);
  color white;
  font-weight bold;
}
#employee-table td {
  border 1px solid #ddd;
  padding 8px;
}

#company-table {
  width100%;
  background-color rgba(46,46,46);
}
#company-table tr {
  padding 8px;
  width 20%;
  text-align left;
  background-color rgba(46,46,46);
  color white;
  font-weight bold;
}
#company-table th {
  padding 8px;
  font-weight none;
}

.user-link {
  border 2px solid #aaa;
  background-color #ddd;
  padding 2px;
  text-align center;
}

a {
  color black;
  text-decoration none;  no underline 
}


`;


 eslint-disable-next-line no-undef
GM_addStyle(styles);