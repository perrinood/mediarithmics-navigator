# Navigator Loading

This specification explains how [Navigator](http://navigator.mediarithmics.com/#/) loads its modules and its plugins modules using RequireJS and AngularJS.  

If you are not familiar with dependencies injection please check out:
* [The RequireJS Documentation](http://requirejs.org/docs/api.html#usage)
* [The AngularJS Dependencies Injection Guide](https://docs.angularjs.org/guide/di)

When you read what is written below pay attention to that fact that there are <font color="#B522DD">AngularJS</font> and <font color="#13BA6E">RequireJS</font> modules that have the same name. The App defines the Navigator and its Plugins. 


## Loading Explained

```
													  /---> module
app ---> app-setup ---> navigator ---> navigator-setup ---> module
				\			^						  \---> module
				 \			|
				  \---> plugins ---> plugin
							   \---> plugin	
```



In the __main.js__ we specify the RequireJS configuration, including the modules paths and dependencies. Our Navigator modules are all defined in the baseUrl folder. The path for the navigator configuration (__app-configuration.js__) is defined in the index.html before loading RequireJS to make Navigator work in production mode. 
We also define the first <font color="#13BA6E">app</font> dependency in order to start the dependencies injection from the __app.js__ file.  

In the __app.js__ file, <font color="#13BA6E">app</font> requires <font color="#13BA6E">app-setup</font> and <font color="#13BA6E">angularAMD</font>, which means that RequireJS will try to load these two modules before loading <font color="#13BA6E">app</font>. <font color="#13BA6E">angularAMD</font> is a module used to bootstrap the AngularJS <font color="#B522DD">app</font> module created by <font color="#13BA6E">app-setup</font>. This allows us to start the <font color="#B522DD">app</font> once everything has been loaded without using AngularJS's _ng-app_ directive.  

In __app-setup.js__ we require all the modules we are going to use as well as <font color="#13BA6E">navigator</font> and <font color="#13BA6E">plugins</font>.

In __navigator.js__, <font color="#13BA6E">navigator</font> relies on <font color="#13BA6E">navigator-setup</font> to build the AngularJS <font color="#B522DD">navigator</font> module. It also sets up the basic configuration and routes to access Navigator itself. <font color="#13BA6E">plugins</font> relies on what is in localStorage to define the Plugins.


## How To Add A Plugin

Open the console in your browser and set the localStorage with the command below, replacing 'foo' with the name of your plugin.

    localStorage.plugins = "[{\"name\":\"foo\", \"moduleName\":\"foo.conf\", \"urn\":\"/foo\", \"setupFile\":\"main.js\"}]"

Setup your plugin configuration then start your plugin and reload navigator.