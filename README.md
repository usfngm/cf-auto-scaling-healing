# Test Cloud Foundry's auto-scaling and self-healing capabilities on IBM Cloud

In traditional computing, hardware resources have always been a restriction meaning that, for instance, when a web server receives more requests that it could handle, it simply dies because it is bounded by the hardware resources inside. In today's fast-paced digital world, applications need to constantly respond and adapt to the ever-changing environment we're in.

Thankfully, cloud computing came to the rescue introducing features like auto-scaling and self-healing. Auto-scaling scales up or down the computing resources automatically according to the current load on the application giving your application consistent and predictable performance under different loads and situations. And self-healing basically restarts your applications whenever it detects that the app has crashed or is down, this increase the overall availablity of your applications.

These features enabled developers to build resilient and fault-tolerant applications which can handle changes and preform well under pressure.  

## Learning Objectives

In this tutorial, you'll learn how to configure auto-scaling in cloud foundry on IBM Cloud. You will also learn how to load test your application and use the metrics tab on IBM Cloud's Cloud Foundry to monitor the app's CPU usage and see it as it scales up and down automatically.

Finally, this tutorial will also test and show how cloud foundry self-heals crashed applications. This give developers an idea on how can they utilize cloud foundry to better serve their apps. 

## Table of Contents
1. [Introduction](#Test-Cloud-Foundry's-auto-scaling-and-self-healing-capabilities-on-IBM-Cloud)
2. [Solution](#solution)
2. [Prerequisites](#Prerequisites)
3. [Estimated time](#Estimated-time)
4. [Steps](#steps)
5. [Summary](#summary)

## Solution

The demo application in this tutorial is a Node.js web server that calculates how many prime numbers are there between 1 and a given number ***n***. The prime numbers calculator is a good problem in terms of putting the CPU under load since it contains two nested loops which results in a complexity of O(n<sup>2</sup>)

    var countPrimeNums = (n) => {
        var result = 0;
        for (var i = 1; i < n; i++) {
            var isPrime = true;
            for (var j = 2; j < i; j++) {
                if (i % j == 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) result++;
        }
        return result;
    }

The web server has two routes handling GET requests

- The **/** root route which will take a number ***n*** in the url as a query string parameter and injects it in the function discussed above and finally returns the result. This is the route we will use to load test our application

- The **/crash** route which deliberately crashes the server in order to test the self-healing feature in cloud foundry


## Prerequisites

Before you begin this tutorial, make sure you have the following:

- An active [IBM Cloud Account](https://cloud.ibm.com)
- [IBM Cloud CLI](https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/) installed
- [Node.js](https://nodejs.org/en/) installed

## Estimated time

- About 20 minutes

## Steps

1. [Deploy the app on IBM Cloud](#1.-Deploy-the-app-on-IBM-Cloud)
2. [Test the self-healing feature](#2.-Test-the-self-healing-feature)
3. [Configure Cloud Foundry auto-scaling](#3.-Configure-Cloud-Foundry-auto-scaling)
4. [Run the load test and see results on the metrics tab](#4.-Run-the-load-test-and-see-results-on-the-metrics-tab)


### 1. Deploy the app on IBM Cloud 
> **Note**: The Cloud Foundry lite plan on IBM Cloud provides you with 256 MB of memory for your apps. This demo uses all of the 256 MB, so if you already have any existing Cloud Foundry apps, please remove them or consider upgrading to the standard plan.

1. Clone [this repo](https://github.com/usfngm/cf-auto-scaling-self-healing)

1. Login to your IBM Cloud account using the IBM Cloud CLI: `ibmcloud login`

2. Target a Cloud Foundry org and space:  `ibmcloud target --cf`

1. If you want, you can change the application name by editing the **name** value in the `manifest.yml` file to your application name (for example, _my-app-name_).

3. Deploy the app: `ibmcloud cf push`
>> **Note**: make sure you run this command while you're inside the project's directory

6. After deployment is done, the CLI will show you the public route in which we could access our app from. In my case, my route was `primenumbercalculator-nice-wombat-pf.eu-gb.mybluemix.net` as shown below:

<p align="center">
  <img style="width: 80%;" src="imgs/1.png">
</p>    

7. Copy the route and paste it in your browser to verify that the app is live and working

    Try passing the variable ***n*** in your url to test the prime numbers calculator as shown in the image below:

<p align="center">
  <img style="width: 80%;" src="imgs/2.png">
</p>   

### 2. Test the self-healing feature

Self-healing comes out of the box with Cloud Foundry and needs no configuration. Thanks to the technology of containerization. 

As mentioned above, our app has a `/crash` route that crashes our application on purpose in order for us to test the self-healing feature.

1. Open two browsers side-by-side or two tabs so you can switch between them fast

2. On one tab, copy and paste your app's url, add `/crash` at the end and hit enter. The app should crash as shown below

<p align="center">
  <img style="width: 80%;" src="imgs/3.png">
</p>  

3. Quickly, go to the other tab and make a normal request at the root route like that one we made earlier. if you're fast enough, you should receive an error like the one shown below

<p align="center">
  <img style="width: 80%;" src="imgs/4.png">
</p>  

>> **Note**: you can try step 2 again in case you didn't receive the error or if you weren't fast enough to make the 2nd request

4. Wait for 30 seconds and refresh the browser again and you should get a normal response again from the server.

What happened is that Cloud Foundry detected that an application has crashed or is down and restarted it automatically making it available again.

You also confirm that your app has crashed and restarted by visiting your resource dashbaord on IBM Cloud

1. Login into your [IBM Cloud Account](https://cloud.ibm.com)

2. Go to your [Resource List](https://cloud.ibm.com/resources)

3. Under Cloud Foundry Apps, you should see the name of your app, click on it.

4. Your resource page should open, this page has all kinds of information about your Cloud Foundry application.

5. Scroll down and you should see the crash report under the **Activity Feed** card as shown below

<p align="center">
  <img style="width: 80%;" src="imgs/5.png">
</p>  

### 3. Configure Cloud Foundry auto-scaling

In this section, we will configure auto-scaling rules then we will load test our application and see it as it scales up and down automatically.

1. Download the [loadtest](https://www.npmjs.com/package/loadtest) tool by running the following:
>> **Note**: the command below should run with administrator privlleges. For **Linux/MacOS** use `sudo` and for **Windows** run the command prompt as admin.


        npm install -g loadtest
        
This tool allows us to send lots of requests per second to our server. This will increase the CPU usage and we will use that to configure our auto-scaling rules.

2. Once again, go to the resource page on IBM Cloud
    
    1. Go to your [Resource List](https://cloud.ibm.com/resources)

    2. Under Cloud Foundry Apps, you should see the name of your app, click on it.

    3. Click on **Autoscaling** from the left menu
    

### 4. Run the load test and see results on the metrics tab

## Summary