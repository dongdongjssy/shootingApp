//
//  IMUITextMessageContentView.swift
//  sample
//
//  Created by oshumini on 2017/6/11.
//  Copyright © 2017年 HXHG. All rights reserved.
//

import UIKit

@objc open class IMUITextMessageContentView: UIView, IMUIMessageContentViewProtocol {
  @objc public static var outGoingTextColor = UIColor(netHex: 0x7587A8)
  @objc public static var inComingTextColor = UIColor.white
  
  @objc public static var outGoingTextFont = UIFont.systemFont(ofSize: 18)
  @objc public static var inComingTextFont = UIFont.systemFont(ofSize: 18)
  
  var textMessageLable = IMUITextView()
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    self.addSubview(textMessageLable)
    textMessageLable.numberOfLines = 0
  }
  
  required public init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  public func layoutContentView(message: IMUIMessageModelProtocol) {
    
    textMessageLable.frame = CGRect(origin: CGPoint.zero, size: message.layout.bubbleContentSize)
    if !message.isOutGoing && (message.atAll || message.atMe) {
        var atText = ""
        let textStr = message.text()
        if message.atAll {
            atText = "@所有人"
        }else if message.atMe{
            let selfNikeName = message.selfNikeName
            let selfUserName = message.selfName
            let atNkName = "@\(selfNikeName)"
            if textStr.contains(atNkName){
                atText = atNkName
            }else {
                atText = "@\(selfUserName)"
            }
        }
    
        let attrStr = NSMutableAttributedString.init(string: textStr)
        let strRange = textStr.range(of: atText)
        if strRange != nil {
            let location = textStr.distance(from: textStr.startIndex, to:strRange!.lowerBound)
            attrStr.addAttribute(.backgroundColor, value: UIColor.init(red: 161/255.0, green: 161/255.0, blue: 161/255.0, alpha: 1), range: NSRange(location: location, length: atText.count))
            textMessageLable.attributedText = attrStr
        }
    
        textMessageLable.font = IMUITextMessageContentView.inComingTextFont
        textMessageLable.textColor = IMUITextMessageContentView.inComingTextColor
    }else{
        self.layoutToText(with: message.text(), isOutGoing: message.isOutGoing)
    }
    
  }
  
  func layoutToText(with text: String, isOutGoing: Bool) {
    
    textMessageLable.text = text
    if isOutGoing {
      textMessageLable.font = IMUITextMessageContentView.outGoingTextFont
      textMessageLable.textColor = IMUITextMessageContentView.outGoingTextColor
    } else {
      textMessageLable.font = IMUITextMessageContentView.inComingTextFont
      textMessageLable.textColor = IMUITextMessageContentView.inComingTextColor
    }
  }
}
