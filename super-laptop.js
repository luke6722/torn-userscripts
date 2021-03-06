// ==UserScript==
// @name         Travel Tools
// @version      0.1
// @description  Making Traveling in Torn fun again
// @author       Luke
// @match        https://www.torn.com/*
// @grant        GM_addStyle
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// ==/UserScript==

// global variables, because I have no coding discipline
let api_key = "";
let user_id = "";

(function() {
    'use strict';

    $(document).ready(function() {
        if ($(".travelling").length){ // this checks the html for any elements that have the class "traveling". This is the only full-proof way I could find to determine if the script should be turned on or not.

            check_user_id();          // make sure we have the user id... this is just in case the user clicks the profile button
            remove_laptop_frame();    // removes the laptop frame, re expands the page content
            add_menu_bar();           // adds bar at the top for navigation

            if(window.location.href.includes("torn.com/companies.php")){
                console.log("your company page");
                build_company_page(0, "Job");
            }
            else if(window.location.href.includes("joblist.php#/p=corpinfo&ID=")){
                console.log("a company page");
                const company_id = window.location.href.split("joblist.php#/p=corpinfo&ID=")[1];     //extracting the company_id from the url, to feed to the api
                build_company_page(company_id, "Job Listing");
            }
            else if(window.location.href.includes("factions.php?step=profile&ID=")){
                console.log("a faction page");
                const faction_id = window.location.href.split("factions.php?step=profile&ID=")[1];   //extracting the faction_id from the url, to feed to the api
                build_faction_page(faction_id, "Faction");
            }
            else if(window.location.href.includes("torn.com/factions.php")){
                console.log("your faction page");
                build_faction_page(0, "My Faction");
            }
            else if(window.location.href.includes("torn.com/item.php")){
                console.log("item page"); // coming soon
            }
        }
    });

})();



function build_faction_page(faction_id, header_text){
    // changes the header text
    $("#skip-to-content")[0].innerText = header_text;

    // removes the "you can't view this while traveling" text (heheheh...)
    $(".info-msg-cont").remove();

    // checking that i know the user's api key before i try to use it
    check_api_key(function() {

        // making an api call for basic company info
        let url = "https://api.torn.com/faction/"+faction_id+"?selections=&key="+api_key; // api call to get basic faction info
        apiCall(url, function(d) {
            let faction = d;
            console.log(faction);
            let faction_leader = "";
            let faction_leader_id = faction.leader;
            let faction_co_leader = "None";
            let faction_co_leader_id = faction["co-leader"];

            let faction_members = "<table id='employee-table'><tr><th>Members</th><th>Days in Faction</th><th>Status</th><th>Last Seen</th></tr>";
            let members = faction.members;

            // cycling through faction members, checking if they are the faction leader or co leader for future use, and creating a row for each member based on info from the api
            for (var prop in members) {
                if (Object.prototype.hasOwnProperty.call(members, prop)) {
                    let mem = members[prop];
                    if (prop == faction_leader_id) {
                        faction_leader = mem.name;
                    } else if (prop == faction_co_leader_id) {
                        faction_co_leader = mem.name;
                    }
                    faction_members += "<tr><td><a href='profiles.php?XID="+prop+"'><div class='user-link'>"+mem.name+"</div></a></td><td>"+mem.days_in_faction+"</td><td>"+mem.status.description+"</td><td>"+mem.last_action.relative+"</td></tr>";
                }
            }
            faction_members += "</table>";

            // 2nd table, which is the top one and gives basic info. This table had to be crated second because I found the faction leader and co leader while creating the member table
            let faction_details ="<table class='company-table'><tr><th>"+faction.name+"<th></th></tr>";
            faction_details += "<tr><th></th><th>Leader: <a href='profiles.php?XID="+faction_leader_id+"'>"+faction_leader+"</a></th></tr>";
            faction_details += "<tr><th></th><th>Co-Leader: <a href='profiles.php?XID="+faction_co_leader_id+"'>"+faction_co_leader+"</a></th></tr>";
            faction_details += "<tr><th></th><th>Members: "+Object.keys(faction.members).length+"</th></tr>";
            faction_details += "<tr><th></th><th>Best Chain: "+format_number(faction.best_chain)+"</th></tr>";
            faction_details += "<tr><th></th><th>Respect: "+format_number(faction.respect)+"</th></tr>";
            faction_details += "<tr><th></th><th>Age: "+age_decoder(faction.age)+"</th></tr></table>";

            // appending the two tables I just created to the html
            $("#mainContainer").append("<br><br><div id='company-details' class='company-divs'>"+faction_details+"</div><br><br><div id='company-employees' class='company-divs'>"+faction_members+"</div>");

        });
    });
}

function build_company_page(company_id, header_text){
    // changes the header text
    $("#skip-to-content")[0].innerText = header_text;

    // removes the "you can't view this while traveling" text (heheheh...)
    $(".info-msg-cont").remove();

    // checking that i know the user's api key before i try to use it
    check_api_key(function() {

        // making an api call for basic company info
        apiCall("https://api.torn.com/company/"+company_id+"?selections=&key="+api_key, function(d) {
            let company = d.company;
            let company_type = "Unknown";

            // taking the number the api gives me as the company type, and getting an actual type name based on the company_types array i have defined below
            if(company.company_type < company_types.length){
                company_type = company_types[company.company_type];
            }

            // if the company_director isn't found and reassigned below, it should mean that you are the company director
            let company_director = "You";

            let company_employees;

            let employee_url;

            // if this is the company you are in, make an extra api call to find out more detailed info, and set the first row of the table accordingly. otherwise, pass the api call function an empty string and it won't do anything
            if (header_text == "Job") {
                employee_url = "https://api.torn.com/company/?selections=employees&key="+api_key;
                company_employees = "<table id='employee-table'><tr><th>"+company.employees_hired+" / "+company.employees_capacity+" Employees</th><th>Eff</th><th>MAN / INT / END</th><th>Pay</th><th>Job Title</th><th>Last Seen</th></tr>";
            } else {
                employee_url = "";
                company_employees = "<table id='employee-table'><tr><th>"+company.employees_hired+" / "+company.employees_capacity+" Employees</th><th>Days</th><th>Status</th><th>Job Title</th><th>Last Seen</th></tr>";
            }
            apiCall(employee_url, function(d_employees) {
                let employees;

                // if you didn't actually make the api call (based on the if-statement right above it) then use the previous api call for employee info. Otherwise, use the new one.
                if (d_employees == 0) {
                    employees = company.employees;
                } else {
                    employees = d_employees.company_employees;
                }
                console.log(employees);

                for (var prop in employees) {
                    if (Object.prototype.hasOwnProperty.call(employees, prop)) {
                        let emp = employees[prop];
                        if (emp.position == "Director") {
                            company_director = emp.name;
                        }
                        let extra = "";
                        if (header_text == "Job") {
                            // find the stars of effectiveness
                            let stars = "";
                            for(let i = 1; i <= 5; ++i){
                                if (i <= emp.effectiveness) {
                                    stars += "&#x2605; ";
                                } else {
                                    stars += "&#x2606; "
                                }
                            }
                            // if it's your company, extract this info
                            extra = "<td>" + stars + "</td><td>" + emp.manual_labor + " / " + emp.intelligence + " / " + emp.endurance + "</td><td>$" + format_number(emp.wage) + "</td>";
                        } else {
                            // otherwise, extract this less exciting info
                            extra = "<td>" + emp.days_in_company + "</td><td>" + emp.status.state + "</td>";
                        }
                        company_employees += "<tr><td><a href='profiles.php?XID="+prop+"'><div class='user-link'>"+emp.name+"</div></a></td>" + extra + "<td>"+emp.position+"</td><td>"+emp.last_action.relative+"</td></tr>";
                    }
                }

                company_employees += "</table>";

                // company details, the first table of the page
                let company_details ="<table class ='company-table'><tr><th>Details of "+company.name+" - "+company_type+"<th></th><th></th></tr>";
                company_details += "<tr><th></th><th>Stars: "+company.rating+" / 10</th><th>Daily Income: $"+format_number(company.daily_profit)+"</th></tr>";
                company_details += "<tr><th></th><th>Type: "+company_type+"</th><th>Weekly Income: $"+format_number(company.weekly_profit)+"</th></tr>";
                company_details += "<tr><th></th><th>Director: "+company_director+"</th><th>Daily Customers: "+format_number(company.daily_customers)+"</th></tr>";
                company_details += "<tr><th></th><th>Age: "+age_decoder(company.days_old)+"</th><th>Weekly Customers: "+format_number(company.weekly_customers)+"</th></tr></table>";

                if (header_text == "Job") {
                    // if it's the company you're in, that's right a THIRD api call for more details about the company itself. This will be the second table of the page.
                    apiCall("https://api.torn.com/company/?selections=detailed&key="+api_key, function(d_detailed) {
                        let detailed = d_detailed.company_detailed;
                        console.log(detailed);
                        company_details += "<br><br>";
                        company_details += "<table class ='company-table'><tr><th>Popularity: "+detailed.popularity+"</th><th>Efficiency: "+detailed.efficiency+"</th><th>Environment: "+detailed.environment+"</th></tr>";
                        company_details += "<tr><th>Bank: $"+format_number(detailed.company_bank)+"</th><th>Ad Budget: $"+format_number(detailed.advertising_budget)+"</th><th>Trains: "+detailed.trains_available+"</th></tr></table>";

                        $("#mainContainer").append("<br><br><div id='company-details'>"+company_details+"</div><br><br><div id='company-employees'>"+company_employees+"</div>");
                    });
                } else {
                    $("#mainContainer").append("<br><br><div id='company-details'>"+company_details+"</div><br><br><div id='company-employees'>"+company_employees+"</div>");
                }
            });
        });
    });
}

function apiCall(url, cb){
    if (url == "") { //if a url is not passed, return 0
        cb(0);
    } else {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(data) {
                if(typeof(data) != "undefined"){ // if what has been entered is not an api key, or if the user has since changed their api key, prompt for a new one
                    if(typeof(data.error) != "undefined"){
                        if(data.error.error == "Incorrect key") {
                            api_key = prompt("Your API key seems to be incorrect, or has changed. Please enter a new API key here, and refresh the page:");
                            GM.setValue("api_key", api_key);
                        }
                    }
                }
                cb(data);
            }
        });
    }
}

// checks to see if the api key has been saved in this userscript, and if not, prompts the user for it, then saves it
function check_api_key(cb){
    (async () => {
        api_key = await GM.getValue("api_key");
        if (api_key == undefined) {
            api_key = prompt("Please enter your API key to access this page:");
            GM.setValue("api_key", api_key);
        }
        console.log(api_key);

        //(async () => {
        //    GM.deleteValue("api_key");
        //})();

        cb();
    })();
}

// checks to see if the use_id has been saved in this userscript, and if not, goes and finds it where it exists in the html
function check_user_id(){
    (async () => {
        user_id = await GM.getValue("user_id");
        if (user_id == undefined) {
            console.log("finding user id");
            let script_tags = document.getElementsByTagName("script"), i=script_tags.length; // searching through all the html elements that are tagged as script
            while (i--) {
                if (script_tags[i].getAttribute('uid') != undefined){ // tries to find the one that has 'uid' defined as an element
                    user_id = script_tags[i].getAttribute('uid'); // once it finds it, saves it as user_id
                    GM.setValue("user_id", user_id); // saves it internally to the script, so we shouldn't have to do this every time
                    break;
                }
            }
        }
        document.getElementById("profile-link").setAttribute('href', "profiles.php?XID=" + user_id);
        console.log("user_id: " + user_id);
    })();
}

// takes in an age in days, and spits it out in years and months
function age_decoder(age){
    return ""+Math.floor(age/365)+" years, "+Math.floor((age%365)/31)+" months";
}

// adds commas to a number to make it more readable
function format_number(num) {
    if (num == undefined) {
        return "0";
    } else {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
}

// removes all the frame elements
// removes the computer-frame-wrap class from the div it is in, in order for the div to remain but the class to go, so the css won't style that div
function remove_laptop_frame(){
    $(".computer-top-frame").remove();
    $(".computer-left-frame").remove();
    $(".computer-right-frame").remove();
    $(".computer-bottom-frame").remove();
    $(".computer-navigation").remove();
    $(".scroll-element_outer").remove();
    $(".computer-frame-wrap").removeClass( "computer-frame-wrap" );
}

// makes duplicates the black horizontal bar at the top
// adds an id to the new one, so i can style it
// adds in buttons that function as links to the different parts of torn
function add_menu_bar(){
    let super_laptop_menu = $( ".header-wrapper-bottom" ).clone().insertAfter( ".header-wrapper-bottom" );
    $( ".header-wrapper-bottom" ).last().append("<div id='super-laptop-menu'></div>");

    $("#super-laptop-menu").append("<a href='index.php'><div class='sl-menu-button'>Flight Page</div></a>" +
                                   "<a href='profiles.php?XID=' id='profile-link'><div class='sl-menu-button'>Profile</div></a>" +
                                   "<a href='messages.php'><div class='sl-menu-button'>Messages</div></a>" +
                                   "<a href='events.php'><div class='sl-menu-button'>Events</div></a>" +
                                   "<a href='companies.php'><div class='sl-menu-button'>Job</div></a>" +
                                   "<a href='factions.php'><div class='sl-menu-button'>Faction</div></a>" +
                                   "<a href='stockexchange.php'><div class='sl-menu-button'>Stock Market</div></a>" +
                                   "<a href='newspaper.php'><div class='sl-menu-button'>Newspaper</div></a>" +
                                   "<a href='forums.php'><div class='sl-menu-button'>Forums</div></a>" +
                                   "<a href='forums.php#/p=forums&f=62'><div class='sl-menu-button'>Community Events</div></a>" +
                                   "<a href='halloffame.php'><div class='sl-menu-button'>Hall of Fame</div></a>" +
                                   "<a href='friendlist.php'><div class='sl-menu-button'>Friends</div></a>" +
                                   "<a href='blacklist.php'><div class='sl-menu-button'>Enemies</div></a>" +
                                   "<a href='pc.php'><div class='sl-menu-button'>Virus Coding</div></a>" +
                                   "<a href='personalstats.php'><div class='sl-menu-button'>Personal Stats</div></a>");
}

//hard-coded to avoid an api call when displaying the company type in the job page
const company_types = ["",
                     "Hair Salon", //1
                     "Law Firm", //2
                     "Flower Shop", //3
                     "Car Dealership", //4
                     "Clothing Store", //5
                     "Gun Shop", //6
                     "Game Shop", //7
                     "Candle Shop", //8
                     "Toy Shop", //9
                     "Adult Novelties", //10
                     "Cyber Cafe", //11
                     "Grocery Store", //12
                     "Theater", //13
                     "Sweet Shop", //14
                     "Cruise Line", //15
                     "Television Network", //16
                     "", //17
                     "Zoo", //18
                      "Firework Stand", //19
                      "Property Broker", //20
                      "Furniture Store", //21
                      "Gas Station", //22
                      "Music Store", //23
                      "Night Club", //24
                      "Pub", //25
                      "Gents Strip Club", //26
                      "Restaurant", //27
                      "Oil Rig", //28
                      "Fitness Center", //29
                      "Mechanic Shop", //30
                      "Amusement Park", //31
                      "Lingerie Store", //32
                      "Meat Warehouse", //33
                      "Farm", //34,
                      "Software Corporation", //35
                      "Ladies Strip Club", //36
                      "Private Security Firm", //37
                      "Mining Corporation", //38
                      "Detective Agency", //39
                      "Logistics Management" //40
                     ]

var styles=`
#super-laptop-menu {
  background-color: rgba(0,0,0,0.6);
  display: flex;
}
.sl-menu-button {
  padding: 9px;
  margin-right: 9px;
  background-color: rgba(0,0,0,0.5);
  color: silver;
  font-family: "Lucida Console";
  cursor: pointer;
}
#employee-table {
  width:100%;
  background-color: rgba(242,242,242);
}
#employee-table th {
  padding: 8px;
  width: 15%;
  text-align: left;
  background-color: rgba(46,46,46);
  color: white;
  font-weight: bold;
}
#employee-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.company-table {
  width:100%;
  background-color: rgba(46,46,46);
}
.company-table tr {
  padding: 8px;
  width: 15%;
  text-align: left;
  background-color: rgba(46,46,46);
  color: white;
  font-weight: bold;
}
.company-table th {
  padding: 8px;
  font-weight: none;
}
.user-link {
  border: 2px solid #aaa;
  background-color: #ddd;
  padding: 2px;
  text-align: center;
}
a {
  color: black;
  text-decoration: none; /* no underline */
}
`;


// eslint-disable-next-line no-undef
GM_addStyle(styles);