# Test Cloud Foundry's auto-scaling and self-healing capabilities on IBM Cloud

In traditional computing, hardware resources have always been a restriction meaning that, for instance, when a web server receives more requests that it could handle, it simply dies because it is bounded by the hardware resources inside. In today's fast-paced digital world, applications need to constantly respond and adapt to the ever-changing environment we're in.

Thankfully, cloud computing came to the rescue introducing features like auto-scaling and self-healing. Auto-scaling scales up or down the computing resources automatically according to the current load on the application giving your application consistent and predictable performance under different loads and situations. And self-healing basically restarts your applications whenever it detects that the app has crashed or is down, this increases the overall availability of your applications.

These features enabled developers to build resilient and fault-tolerant applications which can handle changes and preform well under pressure.  

## Learning Objectives

In this tutorial, you'll learn how to configure auto-scaling in Cloud Foundry on IBM Cloud. You will also learn how to load test your application and use the metrics tab on IBM Cloud's Cloud Foundry to monitor the app's CPU usage and see it as it scales up and down automatically.

Finally, this tutorial will also test and show how Cloud Foundry self-heals crashed applications. This give developers an idea on how can they utilize Cloud Foundry to better serve their apps. 

## Table of Contents
1. [Introduction](#Test-Cloud-Foundrys-auto-scaling-and-self-healing-capabilities-on-IBM-Cloud)
2. [Solution](#solution)
2. [Prerequisites](#Prerequisites)
3. [Estimated time](#Estimated-time)
4. [Steps](#steps)
5. [Summary](#summary)

## Solution

The demo application in this tutorial is a Node.js web server that calculates how many prime numbers are there between 1 and a given number ***n***. The prime numbers calculator is a good problem in terms of putting the CPU under load since it contains two nested loops and has a complexity of O(n<sup>2</sup>)

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

- The **/** *(root)* route which will take a number ***n*** in the url as a query string parameter and injects it in the function above and finally returns the result. This is the route we will use to load test our application

- The **/crash** route which deliberately crashes the server in order to test the self-healing feature in Cloud Foundry


## Prerequisites

Before you begin this tutorial, make sure you have the following:

- An active [IBM Cloud Account](https://cloud.ibm.com)
- [IBM Cloud CLI](https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/) installed
- [Node.js](https://nodejs.org/en/) installed

## Estimated time

- About 30 to 40 minutes

## Steps

1. [Deploy the app on IBM Cloud](#1-Deploy-the-app-on-IBM-Cloud)
2. [Test the self-healing feature](#2-Test-the-self-healing-feature)
3. [Configure Cloud Foundry auto-scaling](#3-Configure-Cloud-Foundry-auto-scaling)
4. [Run the load test and see results on the metrics tab](#4-Run-the-load-test-and-see-results-on-the-metrics-tab)


### 1. Deploy the app on IBM Cloud 
> **Note**: The Cloud Foundry lite plan on IBM Cloud provides you with 256 MB of memory for your apps. This demo uses all of the 256 MB, so if you already have any existing Cloud Foundry apps, please remove them or consider upgrading to the standard plan.

1. Clone [this repo](https://github.com/usfngm/cf-auto-scaling-self-healing)

1. Login to your IBM Cloud account using the IBM Cloud CLI: `ibmcloud login`

2. Target a Cloud Foundry org and space:  `ibmcloud target --cf`

1. If you want, you can change the application name by editing the **name** value in the `manifest.yml` file to your application name (for example, _my-app-name_).

3. Deploy the app: `ibmcloud cf push`
>> **Note**: make sure you run this command while you're inside the project's directory

6. After deployment is done, the CLI will show you the public route ***(URL)*** in which we could access our app from. In my case, my route was `primenumbercalculator-nice-wombat-pf.eu-gb.mybluemix.net` as shown below:

>> **Note**: your route will be different than mine, please use your own route.

<p align="center">
  <img style="width: 80%;" src="imgs/1.png">
</p>    

>> **Important**: If you ever lose your app's url. You can either use the command: `ibmcloud cf app <your_app_name>` and it will output the app's info again **OR** you can find it by visiting [IBM Cloud](https://cloud.ibm/com) and navigating to your resource page which can be found in the [Resource List](https://cloud.ibm.com/resources) under *Cloud Foundry Apps*

7. Copy the route and paste it in your browser to verify that the app is live and working

    Try passing the variable ***n*** in your url to test the prime numbers calculator as shown in the image below:

<p align="center">
  <img style="width: 80%;" src="imgs/2.png">
</p>   

### 2. Test the self-healing feature

Self-healing comes out of the box with Cloud Foundry and needs no configuration. Thanks to the technology of containerization. It is also very easy and straightforward to test, that's why we'll start by testing it.

As mentioned above, our app has a `/crash` route that crashes our application on purpose in order for us to test the self-healing feature.

In order to test the self-healing capabilities of our app, we will first crash our app on purpose by using the `/crash` route. Then we will quickly make a valid request to the prime numbers calculator service on the root route as we did above. You should see that the server is down. After a few seconds, we'll make another request and we'll see that our server is back up and running again without any intervention from our side.

1. Open two browsers side-by-side or two tabs so you can switch between them fast

2. On one tab, copy and paste your app's url, add `/crash` at the end and hit enter. The app should crash as shown below

<p align="center">
  <img style="width: 80%;" src="imgs/3.png">
</p>  

3. Quickly, go to the other tab and make a normal request at the root route like the one we made earlier. if you're fast enough, you should receive an error like the one shown below

<p align="center">
  <img style="width: 80%;" src="imgs/4.png">
</p>  

>> **Note**: you can try step 2 again in case you didn't receive the error or if you weren't fast enough to make the 2nd request

4. Wait for 30 seconds and refresh the browser again and you should get a normal response again from the server.

What happened is that Cloud Foundry detected that the application has crashed or is down and restarted it automatically making it available again.

You also confirm that your app has crashed and restarted by visiting your resource page on IBM Cloud

1. Login into your [IBM Cloud Account](https://cloud.ibm.com)

2. Go to your [Resource List](https://cloud.ibm.com/resources)

3. Under Cloud Foundry Apps, you should see the name of your app, click on it.

4. Your resource page should open, this page has all kinds of information about your Cloud Foundry application as well as tools to help you manage your apps

5. Scroll down and you should see the crash report under the **Activity Feed** card as shown below

<p align="center">
  <img style="width: 80%;" src="imgs/5.png">
</p>  

### 3. Configure Cloud Foundry auto-scaling

In this section, we will configure auto-scaling rules then we will load test our application and see it as it scales up and down automatically.

1. Once again, go to the resource page on IBM Cloud
    
    1. Go to your [Resource List](https://cloud.ibm.com/resources)

    2. Under Cloud Foundry Apps, you should see the name of your app, click on it.

    3. Click on **Autoscaling** from the left menu

4. Configure auto-scaling rules

    *We will have two auto-scaling rules, one for scaling up and another for scaling down*

    1. Set the minimum instance count to **1** and the maximum instance count to **2**

    2. Set the first rule:

        If average `cpu` `>=` `20%` for `60` seconds, then **increase** `1` `instance(s)`. Cooldown period `60` seconds.

    3. Set the second rule:

        If average `cpu` `<=` `5%` for `60` seconds, then **decrease** `1` `instance(s)`. Cooldown period `60` seconds.

<br>
Your auto-scaling rules should look like this

<p align="center">
  <img style="width: 80%;" src="imgs/6.png">
</p>

After making sure everything is perfect, hit the save button at the top of the page.

3. Open the **Metrics** tab

    If everything went smoothly, we should see our auto-scaling rules reflected on the metrics tab as shown below

<p align="center">
  <img style="width: 80%;" src="imgs/7.png">
</p>

Now we are ready to load test our application and see it as it scales up and down automatically


### 4. Run the load test and see results on the metrics tab

1. Download the [loadtest](https://www.npmjs.com/package/loadtest) tool by running the following:
>> **Note**: the command below should run with administrator privileges. For **Linux/MacOS** use `sudo` and for **Windows** run the command prompt as admin

>> **Note**: npm is the node pacakage manager and it comes with Node.js. Make sure you have installed Node.js before running this command


        npm install -g loadtest
        
This tool allows us to send lots of requests per second to our server to mimic what would happen to our server in a real scenario. This will increase the CPU usage and will trigger the auto-scaling rules we have set in the previous step.

2. Start the load test using this command

        loadtest -c 20 --rps 200 -k https://<your-url-here>/?n=1000

    The ***rps*** flag here indicates the *requests per second*. To stress load our app, we will send 200 requests per second asking our app to find us how many prime numbers are there between 1 and 1000. For more information about the loadtest tool, you can check its [github repo](https://github.com/alexfernandez/loadtest).

    >> **Note**: It is recommended to use the same values and parameters as this tutorial. However, in some cases the CPU usage may slightly differ so feel free to adjust the ***rps*** flag to either increase the load or decrease it accordingly

    The output of running this command should look something like this:

<p align="center">
  <img style="width: 80%;" src="imgs/8.png">
</p>

>> **Note**: For the sake of this tutorial, while load testing, make sure you pass the n = 1000. Less might not stress the CPU enough and more might lead to the application crashing.

3. Monitor the CPU usage in the metrics tab

    After a few minutes you should start seeing the CPU usage increasing in the metrics tab till it crosses the threshold as shown below

<p align="center">
  <img style="width: 80%;" src="imgs/9.png">
</p>

4. Wait for the auto-scale to occur

    Based on the auto-scaling rules we have set, the application will auto-scale to 2 instances if the cpu usage stayed at 20% or more for 60 seconds. 

    Wait for a minute or two, then you should find that the CPU usage suddenly went down to 13% ~ 14%. This happened as a result of the new instance that was automatically created to take some of the load we had on our original instance.

<p align="center">
  <img style="width: 80%;" src="imgs/10.png">
</p>

5. Confirm that the auto-scale has occurred

    Click on **Runtime** from the left menu and hit refresh and you should see that now we have 2 instances running as shown below

<p align="center">
  <img style="width: 80%;" src="imgs/11.png">
</p>

6. Test the auto down scaling

    Go back to the **Metrics** tab under the **Autoscaling** page. The CPU usage should be stable at around 13% ~ 14% now.

    What we want is to reduce the load by 75% so we can hit CPU usages under 5% and watch the application as it down scales automatically.

    1. Stop the load test by hitting **Ctrl + C**

    2. Run another load test but with 75% less requests per second as shown below

            loadtest -c 20 --rps 50 -k https://<your-url-here>/?n=1000

    Go back to the metrics, and you will find that the CPU usage is decreasing. It will stabilize at around 3% ~ 4%

    And again just like the case of auto-scaling up, according to our auto-scaling rules, the app will auto-scale down if the CPU usage stayed at 5% or less for 60 seconds.

    Wait for a few minutes and you should see that the CPU usage increases slightly to 6% ~ 7% which means that the app has down scaled successfully back to 1 instance hence the slight increase of CPU usage

    And again, you could confirm the down scaling by going to the **Runtime** from the left menu and hitting refresh and you should see that the app now has 1 instance running

<p align="center">
  <img style="width: 80%;" src="imgs/12.png">
</p>

<p align="center">
  <img style="width: 80%;" src="imgs/13.png">
</p>


## Summary

In this tutorial we discussed, configured and tested auto-scaling and self-healing in Cloud Foundry and saw how beneficial they are in today's modern digital world. 

We saw how easy it is to configure Cloud Foundry auto-scaling rules on IBM Cloud and tested it using a load testing tool and saw the auto-scaling as its happening live. We also tested the self-healing feature that comes out of the box with Cloud Foundry by deliberately crashing our application and watching it as it restarts itself and become responsive once again. 