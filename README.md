# Noise-level-and-light-acquisition-system

This system consists of light and noise level sensors, connected to a STM32F407 discovery development board. Information from the sensors is then sent to a WEB server
 where it is processed and displayed on a WEB application. Data is also saved in a MongoDB database. The WEB application displayes the data in 2 graphs, and offers
 the user an option to toggle a light located near the sensors. 
 
The program on the STM32F407 discovery development board is written in C language using the STM32CubeIDE development platform. Information from the sensors is 
sent to the WEB server using a WiFi ESP click board. This click board is connected to the development board using the STM32F407 discovery shield. The WEB server is written in Python using the Flask web framework, and the communication with the STM32F407 and the WEB application is made possible using the Flask-SocketIO library.
The WEB application is written using HTML, CSS and JavaScript. 
