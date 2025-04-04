cmake_minimum_required(VERSION 3.31)
project(ros2_graph_visualizer)

find_package(ament_cmake REQUIRED)  
find_package(rosidl_default_generators REQUIRED)  
find_package(std_msgs REQUIRED)  

set(MSG_FILES  
  "msg/GraphEdge.msg"  # 🔥 Make sure the path is correct
)

rosidl_generate_interfaces(ros2_graph_visualizer
  ${MSG_FILES}  
  DEPENDENCIES std_msgs
)

ament_export_dependencies(rosidl_default_runtime)  
ament_package()
