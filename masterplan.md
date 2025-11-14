RoadSense Timișoara – Master Plan and User
Flows
Overview and Problem Statement
Every day, drivers face potholes and road damage that can harm vehicles, jeopardize safety, and
increase maintenance costs. Yet, cities often rely on slow, manual reporting (calls or complaints) to learn
about these road issues. This leads to delayed repairs and a persistent problem on urban streets. The
goal of RoadSense Timișoara (working title) is to create a smart, real-time system for pothole
detection and repair management. By leveraging drivers’ smartphones as sensors and providing city
officials with an AI-powered dashboard, RoadSense aims to crowdsource road condition data and
streamline the pothole repair process.
Key idea: Equip drivers with a mobile app that automatically detects potholes (using phone sensors)
and sends their locations to a server. The server aggregates these reports into a heatmap of potholes
across the city and alerts other drivers in real time about upcoming road hazards. City officials access a
web dashboard to see all reported potholes, their severity, and to receive AI-driven suggestions for
repair scheduling (e.g. optimal routes for repair crews). This two-sided approach (drivers + city) ensures
that data collection and action happen in a continuous feedback loop.
This concept addresses the problem by making pothole reporting passive and data-driven. Instead
of relying solely on citizens to call in or inspectors to scout roads, the system automatically
crowdsources pothole information. Similar approaches have been proven feasible – for example,
Boston’s Street Bump project showed that using a smartphone’s accelerometer and GPS can
automatically collect and send pothole information to city databases . RoadSense builds on such
ideas, adding real-time driver warnings and intelligent planning tools for the city.
Solution Outline
RoadSense consists of two main components, working in tandem:
A Mobile Application for Drivers: (iOS app initially) Runs in the background (or while driving) to
detect potholes using the phone’s accelerometer and gyroscope data. When it detects a pothole,
it automatically records the event (location, time, severity of bump) and sends it to the server.
Drivers receive instant alerts if they are approaching a known pothole (especially a severe one),
helping them avoid or slow down in time. The app also displays a map of pothole hotspots
(color-coded by severity) and allows drivers to contribute feedback (e.g. confirm a pothole or
report if one has been fixed).
A Web Dashboard for City Officials (SDM – road maintenance department): An interactive
dashboard that visualizes all reported potholes on a city map (as points or a heatmap). It shows
severity ratings for each pothole, allows filtering by area or urgency, and lets officials update
the status (e.g. mark as “planned for repair” or “fixed”). It also features an AI module to optimize

repair operations – for example, suggesting the best route for a repair crew to fix multiple high-
priority potholes in one go. Additionally, an AI-driven chatbot assistant can help officials query

1

•

•

1

the system in natural language (e.g. “Which five potholes should we address first?”). The
dashboard essentially turns raw crowd-sourced data into actionable information for city
maintenance teams.
Both components share a common backend server which aggregates data, computes pothole severity,
and manages updates. By combining citizen data and government action, RoadSense creates a “human
+ crowd + AI in the loop” system: citizens’ phones gather data, AI analyzes and prioritizes it, and
humans (drivers and officials) take action based on those insights.
Mobile App for Drivers (iPhone)
Core Functionality and Features
Automatic Pothole Detection: The app uses the iPhone’s motion sensors (accelerometer and
gyroscope via CoreMotion) to continuously monitor vibrations and shocks while the user is
driving. A specialized algorithm filters the sensor data to identify the distinct signature of a
pothole hit – typically a sudden sharp vertical acceleration spike. When a significant “bump” is
detected, the app interprets it as a potential pothole encounter.
Context Awareness: To improve accuracy, the app checks several conditions before logging a
pothole event:
Vehicle-like movement – using GPS speed to ensure the user is traveling within a plausible range
(e.g. between ~15 km/h and 90 km/h, not stationary or walking). If speed is zero or very low, a
bump might be a phone drop or a curb at parking, not a road pothole.
Device stability – analyzing the phone’s orientation sensors over time to see if the device is
steady (mounted) versus being waved around. If the orientation is relatively stable (only slight
variations in pitch/roll), it suggests the phone is likely fixed in a car mount (ideal for recording
road bumps). If it’s tumbling or being frequently reoriented, the app may suspect the phone is in
hand and the data might be unreliable (those readings could be user movements rather than
road bumps).
Optional car confirmation – checking if the phone is connected to a car’s Bluetooth or CarPlay,
which further indicates the user is in a vehicle. This isn’t required but if available, it’s a strong
signal to trust the sensor data for pothole detection.
Event Recording: Upon detecting a qualifying pothole bump (and after passing the context
checks above), the app creates a pothole event record containing:
GPS location (latitude/longitude).
Timestamp.
Estimated impact severity (e.g. the peak acceleration in g’s or a calibrated “shock” score).
Vehicle speed at the moment of impact.
Device/user ID (to track unique reports). This record is immediately sent to the backend server
over the network (REST API call or via a socket). The transmission is lightweight (a few data
points), so it can happen in real-time.
Real-Time Alerts for Hazards: The app not only sends data to the cloud, but also receives data
about known potholes. When the driver is approaching an area where a pothole has been
reported (especially if it’s high severity), the app issues a warning:
•

•

•

•

•

•

•
•
•
•
•

•

2

A voice alert (text-to-speech) saying something like “Caution: severe pothole in 50 meters, right
lane.”
A push notification or on-screen alert for additional clarity (useful if sound is off).
These alerts are generated by comparing the driver’s GPS location and route with the database
of potholes ahead. This requires either continual polling or a subscription to updates from the
server. Implementing this via a WebSocket or push notification system is ideal for instant
response.
The distance threshold and conditions for alerts can be tuned (e.g. only warn for potholes above
a certain severity score, and only if they are directly on the driver’s current road path).
This feature turns the crowd-sourced data into immediate safety benefits for users, helping
them avoid damage in real time.
Pothole Map (Heatmap): Drivers can open the app’s map view to see all the reported potholes
around them or in the city. Each pothole location might be shown as:
A colored dot or icon: green for minor issues, yellow/orange for moderate, red for severe
potholes (based on the severity score computed by the backend).
Possibly different icon shapes for recently fixed potholes or other classes (e.g. a distinct icon for
speed bumps if those are also detected and logged separately).
A heatmap overlay can show density of potholes – areas of the map glowing red if they have
many reports close together (indicating a generally rough stretch of road).
Users can tap on a pothole marker to see details like “5 reports, last 1 hour ago, severity 7/10,
status: planned for repair”. This gives transparency into whether the city is aware or is acting on
a given road issue.
User Feedback and Confirmation: To further improve data quality, the app can solicit input
from drivers in a minimally invasive way:
After a driving session (when the user stops or ends their trip), the app could show a summary:
“We detected 3 potholes on your route. Were these accurate?” The driver could tap “Yes” or “One
was wrong” etc. If they indicate a false detection, the system can flag that event for review
(especially if many users say a certain spot wasn’t actually a pothole).
Manual Reporting: If a driver spots a pothole that the system didn’t catch (for example, they
managed to avoid it so no jolt was recorded, or they see one on the other side of the road), the
app can allow a manual report. A simple interface (perhaps just tapping on the map or a “Report
pothole” button) could let them drop a pin at the location. Ideally, they would only do this when
safely stopped – the app might buffer the GPS location when they tap “Report” and then later let
them confirm details.
Photo Capture: The app can offer the user the ability to take a photo of the pothole (when
safe, e.g., by pulling over or by a passenger). This serves two purposes: providing visual
evidence/description for city officials, and enabling AI verification of the pothole (discussed
later). The interface would likely activate the camera with one tap and automatically attach GPS
and timestamp.
Gamification (Future Enhancement): To encourage participation, the app might include a
rewards system. For example, drivers earn points or badges for miles driven with the app, for
the number of potholes their data helped identify, or for confirming fixes. Boston’s Street Bump
app introduced the concept of “street cred” points for each reported pothole that got fixed .
•
•
•

•

•

•

•
•
•

•

•

•

•

•

•

2

3

In RoadSense, a leaderboard or achievements could be used in later stages to boost user
engagement, especially if this expands to many users.
Overall, the mobile app is designed to be hands-free and user-friendly. The driver’s primary role is
simply to run the app while driving – the detection is passive. The only time user interaction is needed is
optional (after-trip feedback, taking a photo, etc.), so it doesn’t distract from driving. To maintain ease of
use, the app will strive to run in the background or alongside navigation apps. (Notably, earlier
attempts like Street Bump found it problematic that users had to explicitly start/stop recording and
keep the app in foreground . RoadSense would aim to integrate more seamlessly, possibly taking
advantage of iOS background modes for location updates to keep sensor monitoring alive to a
reasonable extent.)
Pothole Detection Algorithm (Tech Details)
Under the hood, the app’s detection logic works roughly as follows:
The app accesses the accelerometer (measuring acceleration in X, Y, Z axes) and gyroscope
(measuring rotation rates around axes) at a high frequency (e.g. 50 Hz or 100 Hz).
Because the phone can be in any orientation relative to the car, the first step is to transform the
acceleration to the ground reference frame. Using gyroscope data or the platform’s
DeviceMotion APIs, we can obtain gravity direction and isolate the acceleration in the vertical
direction (towards gravity). Essentially, we want the component of acceleration that corresponds
to the car moving up/down.
Apply a high-pass filter to the vertical acceleration signal. This removes the effect of smooth
changes like gradual hills, acceleration due to speeding up or slowing down, and normal driving
vibrations. What remains are sudden jolts and spikes.
Monitor the filtered signal for peaks that exceed a certain threshold value. This threshold would
be determined empirically (e.g., a spike > 1.5g in the vertical axis might indicate a pothole). There
might also be a minimum time gap between events to avoid double-counting one pothole (e.g.,
once a spike is detected, ignore additional spikes for the next second or two to allow the car to
finish passing the pothole).
Optionally, consider the gyroscope data: a pothole might cause a sharp jolt but not necessarily a
big device rotation, whereas a phone being tossed in hand could show more complex motion.
Patterns in gyro vs accelerometer could help distinguish real road impacts.
Each time a potential pothole event is recognized, create the event record (as described) and
send it out. The detection algorithm should mark it with an estimated severity which could simply
be the peak acceleration or a scaled value thereof (perhaps scaled 0-100 for server convenience).
False-positive discrimination: Many non-pothole events can trigger accelerometer spikes. The
app will use contextual filters:
If the car goes over a speed bump: There is a rise and fall pattern in acceleration (two peaks with
a time gap) as the wheels go up and then down the bump, typically over a slightly longer
duration (~0.5s). A pothole is more like a sharp negative spike (drop) followed immediately by a
positive spike (wheel coming out of the hole). The app’s algorithm can try to differentiate these

by pattern. Additionally, if the location is one where multiple users always get a similar double-
bump pattern, that spot can be flagged as a speed bump (and perhaps not reported as a

“pothole”, though the app might still use it to warn the driver of a bump).
If the car hits a curb or driveway at low speed: Often a driver turning into a driveway or parking
will go over a small curb lip, causing a bump. But this usually happens at very low speed and
often with a distinct tilt (one wheel at a time). The app can check: if speed < 10 km/h and a bump
is detected alongside a sudden change in device pitch/roll (car climbing a curb), then it’s likely
not a pothole on the road and can be ignored.

3

•
•

•

•

•

•

•
•

•

4

If the user is in a public bus or tram: Buses hitting bumps can generate huge jolts, but those
might not correspond to potholes cars would hit (buses have different suspension and often
travel lanes or routes not identical to cars). To avoid buses skewing data, the app could:
Detect if the route matches known bus routes (using GTFS public transit data for
Timișoara, if available). If a user’s path aligns with a bus line and includes frequent stops,
assume they might be on a bus and treat data as lower confidence.
Identify repetitive bump patterns – a bus might have a rhythmic vibration or consistent
stops that a normal car wouldn’t. Possibly use a simple classifier on sensor data to
differentiate a bus ride from a car ride. (E.g., long idles at stops, higher floor vibrations).
Alternatively, allow users to declare mode (Driver vs Passenger vs Bus) at start; if
someone says they are on a bus, the app could either not collect data or tag it
accordingly.
Through these measures, the aim is to minimize false positives at the source. Nonetheless,
some false events may get through. That is acceptable, as the backend can further filter by
looking for corroboration (multiple drivers reporting the same spot). The system is robust as
long as isolated false reports don’t trigger major actions. Boston’s project learned that requiring
multiple reports for the same location is key to reliability , and RoadSense adopts the same
philosophy (explained more in the backend section).
User Flow for Drivers
To illustrate how a typical driver interacts with the system, consider the following user journey:
Launch & Setup: The user installs the RoadSense app on their iPhone. On first launch, they go
through a quick onboarding:
They grant location permission (“Allow while using the app” or “Always allow” if we want
background updates).
They grant motion sensor access for accelerometer/gyroscope data.
They might sign in or create an account (using Auth0 for email or single-sign-on with Google/
Apple). Alternatively, a “continue as guest” with limited features could be offered, but having an
account allows their contributions to be counted and distinguishes official users.
The app explains the importance of keeping the phone mounted securely in the car for best
results.
Start Driving Mode: The user mounts the phone on their dashboard or windshield holder. They

open the app and tap a “Start Drive” or “I’m driving” button (unless the app is designed to auto-
detect driving). This puts the app in monitoring mode. The screen might switch to a minimalist

interface (perhaps a map view showing their route and any upcoming potholes) and indicate it’s
recording sensor data. The user can now mostly forget about the app as they drive.
Detection in Action: As the user drives over a road, suppose they hit a pothole. The phone,
being jostled, registers a spike. The app’s logic detects this and instantly:
Creates a new event with the exact location and time.
Optionally, shows a small pop-up or tone: e.g., a brief chime or vibrate to note “pothole
detected!” (This feedback can assure the user the app noticed the bump, but it shouldn’t be too
distracting. Some apps might not notify at all to avoid annoyance.)
Sends the event data to the backend server over the cellular network.
•

◦

◦

◦

•

4

1.
2.
3.
4.

5.

6.

7.

8.
9.

10.

5

Driver Alert: Now imagine a different scenario on the same trip: a few kilometers later, the
driver is approaching a location where another user previously reported a severe pothole.
When the driver is, say, 100 meters away, the app receives a trigger (either by checking the
location or via server push) and outputs: “Alert: Big pothole ahead!” The driver, now forewarned,
slows down. Indeed, they encounter a nasty pothole but at a safe speed, avoiding damage. In
this case, the app likely also logs this hit (if they couldn’t avoid it), reinforcing the data on that
pothole.
Trip Completion: After reaching the destination, the user stops the drive monitoring. Depending
on implementation:
They might tap “End Drive” in the app. The app then could summarize: “Trip completed. Potholes
detected: 2. Thanks for contributing!”
If they forget to stop, the app might auto-stop after a period of no movement or when it detects
they’ve left the car (like disconnect from car Bluetooth).
After stopping, the app might present a quick feedback prompt: “We detected 2 potholes. Were
these accurate?” If the user chooses, they can confirm or correct the detections (e.g., maybe one
was actually a speed bump, so they mark it as not a pothole).
The user can also review the map to see where those were and possibly add any comment or
photo if they didn’t during the drive.
Ongoing Use: The next time the user drives, they simply repeat the process. They might not
need to log in again (persistent login). Over time, they accumulate contributions. If gamified,
they might see something like “You’ve helped report 15 potholes!” which could be satisfying.
Also, as the city fixes potholes, the user may notice some alerts disappear or an app notification:
“Good news – a pothole you encountered on Blvd X has been fixed by the city.” This closes the
feedback loop and encourages continued use.
Throughout, the emphasis is that the user flow is simple and mostly hands-off. The app quietly
gathers data and provides safety value (alerts), requiring little effort from the driver beyond running it.
Web Dashboard for City Officials (SDM)
For the municipal side (e.g., Timișoara’s Department of Public Roads or a Smart City team), the web
dashboard is the command center for interpreting the crowdsourced data and managing repair
workflows. It is essentially a management web application with the following key elements:
Features and Interface
Secure Login & Roles: Only authorized personnel can access the dashboard. Using Auth0 (or
similar), accounts can be set up for administrators, dispatchers, engineers, etc. Some may have
read-only access, others can update statuses. This ensures data isn’t tampered with by the
public.
City Map with Pothole Overlay: The centerpiece is an interactive map of Timișoara (or the
relevant region) showing all reported pothole locations:
11.

12.

13.
14.
15.

16.

17.

•

•

6

Each pothole (cluster) is indicated by a marker. The color intensity represents severity (as
computed by the system). For example, mild issues show as green/yellow dots, while major
potholes are red.
The heatmap mode can be enabled to visualize density – areas with many potholes will glow
brighter. This can quickly highlight neighborhoods with poor road conditions.
Markers can have different shapes or annotations if needed (e.g., a checkmark on ones marked
“fixed”, or an icon for “ongoing repair” if a crew is currently assigned).
Clicking a marker opens a detail tooltip or sidebar with comprehensive info on that pothole:
Location (address or cross-street if possible).
Severity score.
Number of reports (and optionally, number of distinct users who hit it).
Average and max shock values recorded.
First reported date and most recent report date.
Status (New, Planned, In Progress, Resolved, Rejected).
If available, a photo of the pothole (as uploaded by a user or taken by an official) – the
image can help assess its size/seriousness visually.
A comments/history section: e.g., “Marked as fixed on Nov 10, awaiting verification” or
“Crew #3 dispatched on Nov 12”.
Filtering and Search: The interface provides filters to manage the view:
By severity or status: e.g., show only severe (red) potholes, or show only those that are “New”
and not yet addressed.
By timeframe: e.g., only show potholes reported in the last week (useful after a major weather
event causing new potholes).
By region: e.g., select a specific district or draw a polygon on the map to see potholes in that
area. This helps in dividing work among city zones.
Search: Allows finding a specific street name or location to see if any potholes reported there.
These filters help city officials focus on what’s most relevant at any given time (e.g., if a local
official only cares about their district, they can filter to that).
Pothole List/Table: In addition to the map, a sortable list of pothole entries might be provided.
Each row would have columns like Location, Severity, Reports, Status, Age (time since first
report). Officials can sort by severity to get a priority list or sort by age to see which issues have
been open longest. They can click a row to locate that pothole on the map (or vice versa).
Status Updates and Notes: The dashboard allows officials to change the status of a pothole
cluster:
For example, when a pothole is verified and scheduled for repair, they set it to “Planned” and
maybe add a note like “Scheduled in next Tuesday’s route”.
When a crew is actively out to fix it, status to “In Progress”.
Once fixed and confirmed, status to “Resolved” (which might remove the marker from default
view or turn it a different color like green).
If a report is deemed incorrect (e.g., upon inspection, no pothole found or it was a construction
bump), status “Rejected/Invalid”.
These statuses help track the lifecycle of each reported pothole from detection to resolution, and
they inform the mobile users’ app as well (e.g., not warning about a pothole that’s already
resolved).
•

•
•

•
◦
◦
◦
◦
◦
◦
◦
◦

•
•
•
•

•

•

•

•
•
•
•
•

7

Bulk actions: If needed, officials could close multiple potholes at once (e.g., mark a cluster of
nearby ones resolved if a road was repaved entirely).
Analytics Dashboard: A section of the web app provides analytical summaries:
Statistics: total number of potholes reported, how many fixed to date, average severity, etc.
Breakdown by area: e.g., a bar chart of potholes per neighborhood or a ranking of top 5 worst
streets.
Trends over time: line charts showing number of reports per week or month, average
resolution time, the trend of road conditions – ideally showing improvement as fixes happen.
Performance metrics: If needed for management, stats like “% of reported potholes addressed
within X days”.
These analytics can be used for internal assessment and also for public transparency (reporting
improvements to citizens).
AI Route Planning for Repairs: One of the standout features is the AI module that suggests
optimized repair routes:
The official can input some parameters, e.g., “Plan routes for 2 crews for today covering the
highest priority potholes”. (They might also specify a time budget like each crew has 4 hours).
The system will take the set of potholes that are currently in “New/Planned” status (or those
above a certain severity threshold) and run an algorithm to cluster them into 2 routes,
attempting to maximize the number of fixes while minimizing travel distance. This is effectively
solving a Vehicle Routing Problem (VRP) or multiple traveling salesman problems.
For each route, the dashboard could output:
An ordered list of pothole locations (with addresses) in the sequence the crew should
tackle them.
A map polyline showing that route.
Total distance and estimated drive time (maybe using a mapping API to calculate travel
times).
Which potholes from the list are covered and their statuses could automatically change to
“In Progress” once a route is activated.
The official can tweak if needed (maybe manually drag the route or remove a point if it’s not
feasible).
This feature helps ensure repair crews are used efficiently – they aren’t criss-crossing the city
randomly, but following a logical path that covers the worst problems. For example, if there are
10 serious potholes scattered in the city and 2 crews, the system might assign 5 to each crew,
grouping nearby ones together.
AI Optimization: The route suggestion can incorporate AI in various ways: using known
algorithms (OR-Tools, etc.) for optimization or even AI planning. The “AI” aspect could also come
from predicting how long each fix takes (maybe based on pothole severity or type) and factoring
that in.
AI Chatbot Assistant: To make the dashboard even more user-friendly, a chatbot interface can
be integrated (likely as a sidebar or modal where the official can type questions). This AI
assistant would be connected to the backend data and possibly an NLP engine. Some usage
examples:
•

•
•
•
•
•

•

•

•
•

•
◦
◦
◦
◦
•
•

•

•

8

The official types: “What are the top 5 worst potholes right now?” The bot could query the database
and answer: “The top 5 by severity are: 1) Calea Aradului nr. 5 (Severity 92), 2) Str. Cluj near nr.12
(Severity 88), ...” possibly with a prompt to highlight them on the map.
“Show me potholes in Cetate district reported this week” – the bot could activate a filter or generate
a mini report.
“How many potholes were fixed last month?” – it can retrieve from status logs and answer.
“Plan a repair route for 3 potholes in the city center” – the bot could leverage the route planning
module to suggest a route.
This kind of interface can simplify complex operations for officials who are less tech-savvy; they
can ask in plain language and get results. It’s essentially a natural language layer on top of the
dashboard’s functionality.
Implementation might use a large language model that has knowledge of the system’s API or
database (fine-tuned, or by injecting relevant data into the prompt). Since this is advanced, it
would likely be implemented after the core features or as a demo specifically for the hackathon’s
novelty.
Admin Tools: The dashboard can include administrative controls, such as:
Managing user accounts (especially marking certain mobile app users as “verified city vehicle”
which influences data weight).
Configuration settings (e.g., adjusting the thresholds or weights for severity scoring, toggling
certain filters).
Viewing raw reports if needed (for debugging, they could see the individual events that make up
a cluster).
Workflow for City Officials
Here’s how city personnel would typically use the system:
Morning Check-in: A city road maintenance manager opens the dashboard at the start of the
day. They see an overview of all current pothole reports. The heatmap immediately shows if any
new clusters popped up overnight (for example, after a storm, new potholes might appear and
be flagged by early commuters).
Prioritization: They look at the list of potholes sorted by severity. Suppose the top item is a very
severe pothole on a major road that has, say, 10 separate hits reported. They click it, see the
details, maybe view the attached photo showing it’s a deep hole. They decide this one is an
urgent fix. They change its status to “Planned” and add it to today’s repair list.
They identify a few more high-severity or high-traffic potholes that need attention. In total,
imagine there are 8 that they want to address as soon as possible. They have two repair crews
available today.
Route Planning: The manager opens the route planner tool, inputs “Crews = 2” and perhaps
selects those 8 potholes (or filters to severity and lets the system pick top N). The tool outputs
two optimized routes. For example:
Route A (Crew 1): covers 5 potholes in the northern part of the city, total driving 12 km,
estimated 3.5 hours (including an assumed 20 minutes per fix).
•

•
•
•
•

•

•
•
•
•

1.

2.

3.

4.

5.

9

Route B (Crew 2): covers the other 3 potholes in the city center, 5 km, 2 hours. They review and
accept these routes. The system marks those 8 potholes as “In Progress” and maybe locks them
from other route suggestions.
Dispatch & Update: The manager communicates these routes to the crews (could be via a
printed map or an export to a navigation app). As crews fix each pothole, they can inform the
manager (via radio or even a simple companion mobile app for crews). The manager then
updates each fixed pothole’s status to “Resolved” in the dashboard (or the crew could do it via a
mobile interface if provided). When marking resolved, the system could prompt for confirmation
like “Are you sure this pothole is fixed?” and possibly allow uploading a “fixed” photo as proof.
Real-time Adjustments: If new urgent reports come in during the day (the dashboard can have
live updates via WebSocket), the manager sees them. If something critical arises, they might
reassign a crew or plan it for the next day. The system’s continuous feed ensures no reported
pothole goes unnoticed.
End-of-day Review: The manager checks analytics – e.g., “5 potholes fixed today, 3 new reports
came in”. They might generate a quick report for their superiors or for public update (the data
can be used to inform citizens, like via social media: “We repaired 5 potholes today including on
Blvd. X and Y, thanks to crowd reports via RoadSense”). This demonstrates the city’s
responsiveness and closes the loop with citizens.
Periodic Maintenance: Over weeks, the historical data collected might help identify chronic
problem areas. For instance, one street might have recurring issues – the analytics might show
that “Street Z has had 10 potholes in 6 months”. This could flag a need for a more permanent
resurfacing rather than patching. Thus, the city can make longer-term plans (resurface, improve
drainage, etc.) based on these insights.
The overall workflow transforms the traditionally reactive approach (waiting for complaints) into a
proactive, data-informed process. Officials spend less time scouting for potholes and more time
efficiently fixing them, guided by live data and AI assistance.
Data Processing and Pothole Severity Scoring
A crucial part of RoadSense lies in how the backend server aggregates raw data from phones into
meaningful pothole information. The system must turn numerous individual bump events (which
might be noisy) into a reliable set of pothole records with a measure of severity. Here’s how that works:
Event Aggregation and Clustering: Each bump event from a phone arrives at the backend with
a location and time. Rather than treat every single bump as a separate “pothole,” the server
performs clustering:
Two events that occur very close to each other (spatially, say within ~10-20 meters) and within a
reasonable timeframe likely correspond to the same physical pothole being hit by different
cars. The backend groups such events into one cluster identifier.
A simple method is to check for any existing pothole cluster within a small radius of the new
event’s coordinates. If found, attach this event to that cluster; if not, create a new cluster entry.
Clusters can also have a time aspect – if a pothole was fixed and then a much later event comes
in at the same spot, ideally that should be a new cluster (as it might be a re-opened pothole).
This could be handled by resetting or marking clusters as resolved so new events after resolution
form new clusters.
6.

7.

8.

9.

10.

•

•

•
•

10

Over time, a cluster contains a set of all sensor hits associated with that pothole. For example,
“Pothole #42: location (45.748N,21.209E), events = [IDs...], etc.”
Computing Severity Score (S): For each pothole cluster, the system calculates a severity score S
that represents how bad or urgent that pothole is. The score is derived from:
Impact Magnitude: The severity of the bump as recorded by cars. We use the average impact
(A_avg) and the maximum impact (A_max) from all events in the cluster.
A_avg gives an idea of typical bump strength (e.g., if most cars experience a jolt of, say,
1.2g there, it’s moderately rough).
A_max captures the worst-case jolt someone experienced (e.g., 2.5g, which is quite
severe, maybe a deep pothole at speed).
Frequency of hits (N): The number of distinct reports. If many different drivers (or the same
driver multiple times) hit that spot, it indicates the pothole is in a place unavoidable or heavily
trafficked. A higher N means more vehicles are being affected.
Score formula: We combine these factors, for instance:

where norm() means we normalize each value to a common scale (0-1 or 0-100) based on
expected min/max. The weights w1, w2, w3 determine importance. Likely w2 > w3 > w1:
w2 (max impact) is highest because even a single extremely hard hit (huge pothole) is
critical.
w3 (count) is next, since a pothole that’s hit hundreds of times is definitely causing
cumulative harm.
w1 (avg impact) helps differentiate if all hits are consistently strong (which reinforces
seriousness).
The score S could be scaled to 0-100 or a simpler 1-5 severity level. In any case, the map coloring
will correspond to this (with thresholds or gradient).
Example: Suppose Pothole #42 cluster has A_avg = 1.5g, A_max = 2.8g, N = 10 reports. After
normalization (say 3g = 100 score for impact, and maybe 10 reports = moderate frequency), we
might get S ≈ 80/100 (a high severity due to very strong jolts and multiple hits). Another pothole
#43 might have A_avg = 1.0g, A_max = 1.2g, N = 50 (lots of cars but it’s a shallow pothole) – that
might score around 60 (because frequency is high but impact low). The city might choose to
prioritize #42 first due to higher damage potential, even though #43 annoys more drivers, it’s
less damaging per hit.
Heatmap Calculation: The heatmap shown to users can be derived from either the severity of
single potholes or the density of multiple potholes:
For driver display, it might make sense to highlight any area with severe potholes (so using
severity directly).
Alternatively, a true heatmap could sum contributions of all potholes in an area, but that’s more
for city overview than driving alerts.
We will likely base it on severity of each cluster, which in turn already accounts for frequency.
Multiple Reports and Confidence: The system inherently benefits from crowd validation. If
only one car reported a pothole and no one else did, the cluster’s N is 1 (low) and we might keep
its severity score relatively low until more evidence accumulates. This aligns with the idea
•

•

•
◦
◦
•

•

S = w1 ⋅ norm(Aavg) + w2 ⋅ norm(Amax) + w3 ⋅ norm(N),

◦
◦
◦

•

•

•

•
•

•
•

11

learned from Street Bump: authorities act only when there are multiple independent reports .
In RoadSense, a single event might still be shown (especially to drivers as a heads-up), but the
city might not rush to fix it until it’s confirmed by others or manually verified. On the other hand,
once 3 or more separate drivers have hit the same spot, we have high confidence it’s a real
pothole that merits attention . This approach filters out one-off false readings (e.g., a phone
dropped in the car can mimic a pothole event – but it’s unlikely that multiple different cars
“dropped phones” at the same GPS coordinate).
False Positive Handling on Backend: In addition to phone-side filtering, the backend can apply
rules:
If a cluster has many events but all from the same user/device, it might be an outlier (maybe
that person’s phone mount is too sensitive or they drive a bumpy vehicle). The system could
weight multiple events from one user less than events from distinct users. Ideally, N counts
unique users more strongly than repeat hits by one user.
If a cluster consistently has very low impact values (just above threshold) and never grows, it
might not be a pothole; could be noise. The system could auto-flag clusters that don’t reach a
certain confidence within a time window to be hidden unless further data comes.
Integration with external data: for known speed bump locations (if the city or OpenStreetMap
provides those), the server could recognize coordinates that match a speed bump and mark
those clusters differently (and maybe exclude from “pothole” list to focus on actual road
damage). Those might instead feed into a separate category of “speed bump alerts” for drivers.
Transit route filtering: If we identify certain events likely came from buses (e.g., matching bus
route timing or from a user account labeled “bus sensor”), we might exclude or down-weight
those in the main dataset. Or handle them separately for transit authorities if needed.
AI Image Validation: When a photo of a suspected pothole is submitted (either by a driver or an
official in the field), the backend can use an AI service to analyze it:
An image recognition model (like a CNN trained on road damage, or an API such as a
hypothetical Google Gemini Vision API) processes the picture.
The AI determines if the image actually contains a pothole or road crack, and potentially the
extent of it (some models might even estimate pothole width/depth from the image, especially if
there’s a reference like a standard road marking or using multiple images/stereo – but that’s
advanced).
If the AI confirms it’s a pothole, the system marks the cluster as validated and perhaps boosts
its severity score (since visual confirmation means it definitely exists and likely is significant if
someone took the trouble to photograph it).
If the AI says “no pothole” (maybe the image was of something else, or unclear), the system can
flag that discrepancy. A human might then review to decide (the photo might have been poor
quality).
This step adds an extra layer of confidence. It does require users to take photos, which may not
happen for every pothole, but for major ones it could be common. Officials could also use a
mobile device to snap a pic when they go to inspect, feeding into the same AI.
Notably, a similar approach was taken by other projects: for instance, a hackathon project
DeepHole used a deep neural network to automatically detect road damage from images
and only uploaded a report if a pothole was present . RoadSense’s design integrates both
sensor triggers and image verification to maximize accuracy.

5 6

7

•

•

•

•

•

•

•
•

•

•

•

•

8

12

Data Storage: All the above information is stored in the system’s database:
Events Collection: each raw event (with user ID, timestamp, accel data summary, etc.). This could
be large, but it’s useful for auditing and refining algorithms. In production, one might purge old
events after clustering to save space.
Pothole Clusters Collection: one entry per identified pothole, storing current severity, location,
status, list of event IDs or aggregated data (A_avg, A_max, count, etc.), and maybe a history of
status changes.
Photos Collection: if storing images or URLs to images and any AI analysis results (could also be
part of cluster data).
User Collection: user profiles, including any special flags (admin, city-official, trusted driver, etc.),
and maybe a points tally if gamification.
Possibly Routes or Plans Collection: saving suggested repair plans (though those could be
generated on the fly).
Real-Time Processing: The backend should process incoming data quickly:
When a new event arrives, the clustering and severity update for the affected cluster should
happen within seconds. If severity crosses a threshold or a new pothole is formed, the system
can immediately trigger notifications to nearby drivers (hence why a push mechanism is
beneficial).
Similarly, when an official marks a pothole “resolved”, the backend should propagate that to
clients so they can stop warning about it. Maybe resolved potholes are kept for record but not
sent out in alert queries.
In summary, the data processing pipeline consolidates raw crowdsourced sensor data into reliable
pothole intelligence. It uses statistical aggregation (averaging, max, counts) and optional AI validation
to assess each pothole’s seriousness. By doing so, it ensures the city is reacting to real problems (many
data points confirming a pothole) and that drivers are warned about legitimate hazards, not random
false alarms. The approach of requiring multiple confirmations unless an impact is extremely high
keeps false positives under control (Boston’s project, after algorithm improvements, kept false positives
<10% , and we aim for a similarly high precision). Citizens and city officials can trust that a red dot on
the map truly means a nasty pothole is there.
System Architecture and Project Structure
Implementing RoadSense involves several components working together. Below is an outline of the
architecture and how the project could be structured:
Architecture Overview
[ Mobile App (iOS) ] <---> [ REST API / WebSocket ] <---> [ Backend
Server & DB ] <---> [ Web Dashboard ]
Mobile App (iOS, RoadSense Driver): Responsible for data collection from sensors, user
interaction for alerts and map display, and sending/receiving information from the backend. It’s
built with React Native (Expo) for iOS. Key sub-components:
Sensor Manager: interfaces with the phone’s accelerometer/gyroscope (via Expo Sensors or native
modules) and implements the detection algorithm.
•
•

•

•
•

•

•
•

•

9

•

•

13

Location & Navigation: accesses GPS and possibly uses Map SDK (Apple Maps or Mapbox) to show
maps and user location.
Networking: handles API calls (using fetch/Axios) and possibly a persistent WebSocket (using a
library like Socket.IO client or native WebSocket) for live updates. For example, a WebSocket
channel might push “pothole_alert” messages to the app when approaching a hazard.
UI Layer: screens such as Login, Main Dashboard (with start/stop drive button and quick stats),
Map Screen (with heatmap and markers), Settings, and Feedback dialog. Uses a combination of
React Native components and perhaps Tailwind (via NativeWind) for styling. Framer Motion
could be used for nice animations/transitions (e.g., sliding up the summary panel).
State Management: likely handled by a library (Context API or Redux) for things like current trip
state (recording or not), user info (logged in/out), and storing nearby potholes for alert checks.
Auth: uses Auth0 SDK for authentication (which abstracts social logins and provides JWT tokens
for API calls).
Camera & Media: uses Expo Camera for taking photos, and possibly expo-media-library for
picking from gallery if needed. Photos can be uploaded as multipart form data to the server or
directly to Cloudinary (then send URL to server).
Battery/Performance considerations: The app will use background location mode (to continue
sending data when not in foreground) and will throttle sensor readings when possible to save
battery. We anticipate that continuous sensor access and GPS can drain battery (Street Bump
had this issue ), so optimizing the sampling rate and turning off sensors when not needed
(e.g., when vehicle is stopped) will be important.
Backend Server: A Node.js (Express) application that acts as the middleman between mobile
app, database, and web dashboard. It might be hosted on a cloud platform or even serverless
for certain endpoints. Key responsibilities:
API Endpoints:
POST /api/events – receive a raw pothole event from the app. This triggers clustering
logic.
GET /api/potholes – for a given area or all, returns the list of pothole clusters (with
their severity, locations, etc.). The mobile app calls this to get data for the map (if not
using a push mechanism).
GET /api/potholes/:id – detailed info (for the dashboard when clicking one).
PATCH /api/potholes/:id – update status or other fields (authorized to city users).
GET /api/stats – summary stats for the dashboard.
POST /api/routes – request route optimization (with input like number of teams or
specific cluster IDs, returns route assignments).
Possibly POST /api/upload – to handle image uploads (or we directly use a third-party
for that).
Real-time communication: Integrates Socket.IO (or similar) for pushing events. For example:
When a new severe pothole is confirmed, broadcast a “newPothole” event to all listening
apps (they can decide if the user is near enough to care).
When an app wants live alerts, it could subscribe with its current location and the server
can push relevant alerts (though this could also be done client-side by pulling nearby data
periodically).
Clustering & Business Logic: The server implements the clustering algorithm described earlier.
Likely upon receiving an event, it queries the DB for any cluster in range. If found, update that
cluster’s stats; if not, create new. This could be done at the database level using geospatial
queries (MongoDB supports 2dsphere index for location).
•
•

•

•
•
•

•

10

•

•
◦
◦

◦
◦
◦
◦
◦
•
◦
◦

•

14

Severity Calc: After updating a cluster, recalc its severity S. Possibly store S as a field in the cluster
document for quick access.
Database: Using MongoDB Atlas (cloud MongoDB) as mentioned. Mongo is a good fit with its
JSON-like flexible documents, and geolocation support:
Pothole clusters collection with a geoJSON field for location (indexed), fields for severity,
counts, etc.
Events collection with location as well if needed (for detailed logs or for offline analysis).
Users collection (Auth0 can also provide user profiles, but we may store some extra info).
Optionally separate collections for things like fixed potholes archive, or configurations.
Image storage: Rather than storing images in the DB, images will be stored in Cloudinary (as

noted in the PRD) or a similar CDN. The mobile app can either upload directly to Cloudinary (pre-
signed upload) or send image to backend which then uses Cloudinary API. The cluster entry then

stores the URL of the image and maybe the AI analysis result (true/false for pothole, etc.).
AI Integration: The backend interacts with external AI services:
For image recognition, call the Google Vision API or a custom model endpoint when a
new image is received.
For the chatbot, if using an OpenAI GPT-based service, the backend might relay messages
(including some system prompt with current data) to the AI and stream back answers.
For route optimization, if using an external solver, it might call a Python microservice or
an API. Alternatively, incorporate a solver library in Node.js (there are JS implementations
of simple VRP solvers, or call a Google OR-Tools via a Python script).
Scalability: The server should be stateless (apart from the DB) so it can scale out behind a load
balancer. Using a cloud DB, multiple app server instances can handle API requests from
potentially thousands of drivers. Real-time updates can be scaled using a message broker if
needed.
Web Dashboard Frontend: Built as a single-page web application (SPA) using a framework like
React.js (which pairs well with the React Native knowledge of the team). Could also consider Vue
or Angular, but React is likely given the PRD mentions React. Key components:
Login page: Auth0 integration for web (could share the Auth0 client settings with the mobile app,
using the same domain/tenant).
Main Dashboard page: which contains the map and sidebars. It will use a map library (Mapbox
GL JS or possibly Google Maps JS API or Leaflet with OpenStreetMap tiles) to render the city map
and markers. The heatmap can be done via those libraries (Mapbox has heatmap layer support).
Filters UI: dropdowns or checkboxes for filtering by status, severity, etc.
List panel: a scrollable list of potholes that can be toggled or shown alongside the map.
Detail modal/panel: when a pothole is selected, showing details and allowing status update. This
might include a form for changing status and adding a note.
Analytics view: could be a separate route/page or a section that can slide into view, showing
charts (using a chart library like Chart.js or Recharts).
Route planning UI: when invoked, it might show a dialog to input number of crews or select
potholes, then after computing, draw routes on the map with distinct colors and list the route
instructions. Possibly allow exporting that route.
Chatbot UI: a chat window where the user can type and the bot replies. This could be
implemented with a ready-made chat component or custom. The messages may go to the
backend which then calls the AI service.
Real-time updates: The web app can also use WebSocket or Server-Sent Events to get updates. For
example, if a new pothole is reported while the official is looking, a marker could pop up
automatically. Or if a status was updated by another user, it reflects without refresh.
•
•
◦
◦
◦
◦
•

•
◦
◦
◦

•

•

•
•

•
•
•
•
•

•

•

15

Project structure: The web app might be in its own repository or folder. Within it, components
likely include MapView, PotholeList, PotholeDetail, FilterBar, NavBar (for switching to analytics
etc.), ChatbotWidget, etc. State management can be with React’s Context or Redux if the state is
complex (e.g., list of all potholes loaded, current filters, etc.). We might use hooks to fetch data
from the backend (e.g., useEffect to load pothole data on mount, etc.).
Styling: likely use a modern CSS framework or utility classes (Tailwind CSS was mentioned in PRD,
which can be used in React web as well). Ensure it’s responsive if needed (maybe not crucial since
this is an internal tool for desktop use usually).
Development & DevOps: The PRD hints at using tools like Expo for easy mobile dev and possibly
Vercel or DigitalOcean for deployment.
During development, the team might use services like phyphox (a physics sensor app) to record
vibration data for analysis, which is a clever tool for calibrating the algorithm.

The project could be managed in a monorepo (one repository containing mobile-app , web-
dashboard , backend ) to keep things organized, or separate repos if team members focus on

different parts.
Continuous Integration could be set up to run tests (if any) and deploy to a staging environment.
For the hackathon context, manual deployment is fine, but if this grows into a real project, CI/CD
and cloud infrastructure (with auto-scaling for the server perhaps) would be considerations.
Data Flow Summary
Data Generation (Mobile): Phone detects pothole -> immediately sends event via HTTPS POST
to backend.
Processing (Server): Backend receives event -> clusters it -> updates severity -> stores in DB.
Notification (Server->Mobile): Backend, upon confirming/aggregating, sends out alerts:
To other drivers’ apps in vicinity (via push or socket): “pothole at X”.
This could be immediate or on the next location update poll from the app.
Dashboard Update: The web frontend either polls the server (e.g., every 30s) or is notified via
WebSocket of new/updated pothole data. It updates the map and list accordingly.
City Action: Official changes status or adds info -> sends PATCH/POST to backend -> DB updates
and potentially notifies mobile users if a pothole is fixed (the mobile app could remove the alert
or show it as fixed).
Continuous Loop: More drivers hit or report the pothole -> data strengthens; city eventually
fixes -> status closed; if drivers later pass and no bump is detected, that cluster eventually can be
archived or marked as verified resolved.
The architecture ensures scalability and modularity. The mobile app focuses on data capture and user
alerts, the server focuses on data analysis and distribution, and the web app focuses on human
decision-making and oversight. Each component can be improved or expanded independently (for
instance, the detection algorithm can evolve without changing how the server or dashboard work, as
long as events are sent; or the AI route planner can be improved without affecting data collection).
Implementation Roadmap
Building a robust system like RoadSense can be approached in incremental stages, ensuring that basic
functionality works before adding complexity. Below is a step-by-step master plan for development,
which might correspond to a hackathon timeline or initial sprints:
•

•

•

•
•

•

1.
2.
3.
4.
5.
6.
7.

8.

16

Phase 1: Prototype & Core Data Pipeline (Day 1-2)
Goal: Establish the basic loop of detecting a pothole and displaying it on a map.
Mobile App Basic Setup: Create the React Native (Expo) project. Implement a simple UI with a
start/stop button and permission requests. Integrate Auth0 for login early on (so we can easily
differentiate users).
Sensor Data Logging: Use expo-sensors to access accelerometer and gyroscope. Test reading
values while moving the device. Implement a rudimentary pothole detection (e.g., if vertical
acceleration > threshold). At first, just log events locally or to console.
Backend Setup: Set up an Express server with MongoDB. Implement a simple POST /events
that writes the event to DB. Also implement GET /potholes that retrieves all events or
clusters (initially, without clustering, it can just return recent events as points).
Mobile->Backend Connection: From the app, when a pothole event is detected, send an HTTP
POST to the server. For testing, use a hardcoded server URL or localhost if running emulator.
Ensure the server receives data.
Display on Map (Mobile): Integrate a map component (e.g., MapView from react-native-maps or
Mapbox GL). On receiving response or via a manual refresh, plot the reported pothole point on
the map. At this stage, we might simply fetch all events periodically and show them.
Quick Test: Drive a car (or simulate by shaking phone, or riding over a known bump) to generate
an event. Verify that the event appears on the map in the app. This closes the basic loop and is a
big milestone.
Phase 2: Improve Detection & Data Handling (Day 3-5)
Goal: Reduce false triggers, cluster events, and introduce severity scoring and alerts.
Refine Detection Algorithm: Implement the filtering of acceleration (isolate vertical component
and apply high-pass). Calibrate the threshold by testing: drive over a real pothole vs a speed
bump vs normal driving and observe sensor readings to adjust logic. Possibly implement a
buffer to analyze the shape of the bump (to distinguish sharp pothole vs wider bump).
Orientation Check: Use gyroscope/DeviceMotion to ensure phone orientation stability. If the
variance in orientation is above a threshold in the last, say, 30 seconds, consider the device
“unsteady” and perhaps pause or raise threshold for detection. Also incorporate GPS speed
check to ignore events when speed is out of range.
Clustering on Backend: Instead of treating every event separately, implement clustering. One
approach: on POST /events, after saving the event, run a function to find nearby events (within X
meters) that are not yet clustered or belong to an open cluster. Use a geospatial query with a
small radius. If found, assign this event’s cluster_id accordingly; if not, create a new cluster entry.
Maintain a collection for clusters.
Severity Score Calculation: When updating a cluster (on new event), compute or update its
severity score. This may involve storing running totals: e.g., keep track of sum of amplitudes,
count of events, and max amplitude in the cluster document so you can quickly recalc average
and such. Update the cluster record with the new S value.
API for Clusters: Adjust GET /potholes to return clusters (with aggregated info) rather than
raw events. This is what the app and dashboard will use going forward.
Driver Alerts: Implement a basic mechanism for alerts. Possibly set up a WebSocket channel
that the app listens to. When a new cluster with high severity is created, the backend can
broadcast an event “new_pothole” with its location. The app receives it and if the user is nearby
(within, say, 500m), it triggers a local notification or voice alert. Alternatively, the app could query
the server every minute for any potholes within the next 1 km of its route. For now, even a
simple check every few seconds against the phone’s current coordinates vs known cluster list
could work.
•

•

•

•

•

•

•

•

•

•

•
•

17

Local Notification/Voice: Use Expo’s notifications API or text-to-speech for the alert. Test that a
test event triggers an on-device warning.
Map UI Enhancements: Improve the map on mobile: use colored markers for severity (e.g.,
green/yellow/red pins). Add a legend or a toggle for heatmap if possible (Mapbox GL has
heatmap; if using Google/Apple maps, perhaps skip true heatmap due to time, instead cluster
markers or use color gradient).
Manual Input (basic): Add a button for user to confirm a detected pothole (perhaps alongside
the pop-up when detection occurs: “Mark as real pothole or dismiss”). This input can be sent to
backend to increase confidence. (If time permits in this phase).
Testing: Do a controlled test drive on a pothole-ridden road. Collect data, then inspect the
database to ensure clustering is working (multiple hits cluster together), severity looks
reasonable, and the app warns for upcoming ones as expected. Adjust parameters as needed.
Phase 3: City Dashboard & Full-stack Integration (Day 5-7)
Goal: Give city users a way to visualize and interact with the data, and integrate the remaining features
like photo and AI.
Basic Dashboard Setup: Initialize a React web app for the dashboard. Implement Auth0 login
(likely using the same client ID but redirect flow for web).
Map Display (Web): Use a mapping library (e.g., Mapbox GL JS) to display the city map. Fetch
clusters from GET /potholes and plot them. Implement a simple severity-based coloring
similar to the mobile app.
List & Filter: Add a table or list of clusters. Enable sorting or at least filtering by severity (for a
start, maybe buttons like “Show Critical Only” which filters to S above a threshold).
Status Updates: In the backend, add a field “status” to cluster model. Implement PATCH /
potholes/:id/status to update it. In the dashboard, when clicking a marker or list item,
show a dropdown of statuses to set. This sends the update to backend. Verify changes reflect
(e.g., marker icon could change slightly or become grey when resolved).
Photo Upload & View: Build the pipeline for images:
In the mobile app, integrate the camera. After detecting a pothole (or via a “Report Pothole”
action), allow the user to take a photo. Upon capture, upload the image. Use Cloudinary’s API
(the mobile app can send the image file to the backend, which then uses Cloudinary Node SDK to
upload and get a URL).
Store the image URL in the corresponding cluster (if the cluster is determined at that time – this
is tricky if the event is new, but we could create a cluster immediately when a photo comes with
location).
On the dashboard, if a cluster has an image URL, display the image in its detail view. This helps
officials visually assess the pothole.
Connect the AI Vision API: send the photo to the AI service (e.g., Google Vision or a custom ML
model). Get the result (e.g., labels or a true/false if it’s a pothole). If the AI confirms, maybe
automatically set a flag “verified”. If not, flag for manual check.
This can run asynchronously (the user doesn’t need to wait in-app; they can upload and go).
Voice Notifications: (If not done, implement properly using perhaps text-to-speech on the
device for alerts; Expo’s Speech API can do this).
Route Optimization: Implement a simple version:
Decide on using an algorithm library or brute force for small numbers. For hackathon, one could
do: sort clusters by severity, then greedily assign to crews by nearest neighbor approach.
For each crew: pick the most severe remaining pothole as a start, then find the nearest next one
that fits, etc.
Use Google Maps API distances or haversine formula for simplicity to estimate distances.
•
•

•

•

•
•

•
•

•
•

•

•
•

•
•
•
•
•
•

18

Expose this via an endpoint POST /routes where the request contains number of crews and
maybe a list or filter criteria. The response is a set of route lists.
In the dashboard, create a UI for route planning: a form to input number of crews and possibly a
toggle like “optimize for top 10 potholes” or similar. On submission, call the API and then display
the result:
Draw each route on the map (different color lines). Mark the sequence on markers
(maybe number them 1,2,3... for each route).
Show textual directions (e.g., “Crew 1: A -> B -> C; Crew 2: D -> E -> F”).
This feature is complex, but even a rough solution demonstrates the concept.
AI Chatbot Integration: If feasible, implement a very basic chatbot:
Possibly not a full integration due to time, but simulate it with a small set of predefined Q&A or
use a cheap API with a limited prompt (depending on hackathon constraints).
For instance, use OpenAI API: send a prompt with a summary of current top potholes or stats,
append the user’s question, and get an answer. It may not be perfectly accurate, but it can be
impressive if it works for a couple of queries.
On UI, place a chat icon that opens the chat window. Hook it to a backend route (e.g., POST /
ask ) that handles calling the AI API. Make sure to include some guard that it doesn’t divulge
anything outside scope.
Focus on one or two use-cases (like “list worst potholes” or “how many fixed”).
Testing & Refinement: Before final presentation:
Populate the system with sample data (if real data is scarce, simulate some clusters).
Use the dashboard as if planning a day – ensure filters and status changes work without bugs.
Have someone use the mobile app on a test route to ensure the alerts trigger correctly.
Fine-tune the UI/UX: e.g., make sure the map isn’t too cluttered (maybe cluster close markers
visually), add loading spinners where needed, etc.

Ensure all critical actions (reporting a pothole, marking fixed, route generation) are working end-
to-end.

Phase 4: Deployment and Demo Prep (Day 7+ or Final)
Goal: Package the solution and prepare a compelling demo.
Deployment: Deploy the backend to a cloud service (could be Heroku, DigitalOcean, or Vercel
for the Node API). Set environment variables for DB, Auth0, API keys securely. Migrate the
database to a cloud instance (MongoDB Atlas).
Mobile App Release: If possible, build the iOS app for TestFlight or Expo app so it can run on a
real device for demo (simulator might be fine though for demonstration).
Populate Known Data: If allowed, integrate any known data (like loading the GTFS bus routes
into the system, or known speed bump locations) to show the advanced filtering working. This
might be optional.
Demo Script: Plan a live demonstration:
Show the mobile app detecting a pothole (maybe use a pre-recorded sensor reading or manually
trigger a test event for demo if driving live isn’t possible on stage).
Show the real-time appearance of that report on the city dashboard map.
Simulate another driver receiving an alert for that reported pothole.
Walk through the dashboard: filter by severity, mark an issue as resolved, see it update on app
(could show that the app no longer warns after marked fixed).
Use the AI chatbot: ask “What’s the worst pothole?” and see it answer with the one just reported
(“the one on Street X is very severe, reported 5 times”).
Use route planning: input crews and generate a route, showing how the system helps plan fixes.
By demonstrating both sides and the AI elements, it will cover the full breadth of the solution.
•
•

◦
◦
•
•
•
•

•

•
•
•
•
•
•
•

•

•
•

•
•
•
•
•
•
•
•

19

Slides/Video: Prepare any supplementary materials (maybe a short video of driving with the app
working, if possible, to illustrate the concept in action). Also highlight the impact: e.g., “If widely
used, this system could detect hundreds of potholes in days and cut down the report-to-fix time
significantly, making roads safer and saving money on car repairs.”
Throughout the implementation, we will continuously revisit and refine based on testing results. The
complexity of sensor data means iterative tuning. Also, user experience feedback (even from team
members testing) will guide adjustments (for example, if the app gives too many false alerts initially,
adjust thresholds or logic).
By following this roadmap, we ensure a structured development where each step builds on the
previous. The end result will be a comprehensive system demonstrated at MVP level: an iOS app that
detects and warns about potholes in real-time, and a city dashboard that visualizes these reports and
uses AI to guide repair decisions.
Conclusion
RoadSense Timișoara is a forward-looking project that combines crowdsensing, real-time data, and
AI-driven analytics to tackle a everyday urban problem: potholes. By involving citizens (through the
driver app) and empowering city officials (through the admin dashboard), the solution bridges the gap
between problem detection and problem resolution. Drivers benefit from safer travels due to advance
warnings and ultimately smoother roads; the city benefits from a continuous stream of data to prioritize
repairs efficiently and objectively.
Crucially, the system is designed to be accurate and sustainable: it filters out noise (requiring multiple
independent confirmations of a pothole before raising alarms) and encourages best practices (phones
mounted, etc.) to ensure reliable data . The concept isn’t just theoretical – it builds upon successful
elements from past initiatives (like how Street Bump leveraged smartphones to automatically report
road issues and learned to require multiple reports to act ) while adding modern enhancements
like machine learning verification of potholes and intelligent routing for repairs.
In implementing this master plan, careful consideration is given to technical feasibility (sensor
capabilities, battery usage, data handling) and user experience (simplicity and safety for drivers, clarity
and utility for officials). The result aims to demonstrate a smart city application that is immediately
useful and also extensible. In the future, the same framework could tackle other infrastructure issues
(detecting road bumps, cracks, even snowy/icy patches via vehicle feedback) or integrate with public
reporting apps. But even focusing on potholes, RoadSense can deliver significant value: it creates a live

pothole map of Timișoara, reduces damage incidents, and helps the city fix issues faster with data-
driven prioritization.

By merging crowd-sourced sensor data with AI analytics and a practical workflow for city maintenance,
RoadSense Timișoara exemplifies how technology and community engagement can improve urban life
– making the roads smoother, one pothole at a time.