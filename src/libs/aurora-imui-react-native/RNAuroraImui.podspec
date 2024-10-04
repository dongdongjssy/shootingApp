require 'json'
version = JSON.parse(File.read('package.json'))["version"]

Pod::Spec.new do |s|

  s.name           = "RCTAuroraIMUI"
  s.version        = version
  s.summary        = "react-native-imui"
  s.homepage       = "https://github.com/jpush/imui"
  s.license        = "MIT"
  s.author         = { "jpush" => "jpush" }
  s.platforms      = { :ios => "9.0", :tvos => "9.0" }
  s.source         = { :git => "https://github.com/jpush/aurora-imui.git"}
  s.source_files   = "iOS/**/*","ReactNative/ios/RCTAuroraIMUI/*.*"
  s.dependency 'React'
  s.swift_version = "4.0"

end
