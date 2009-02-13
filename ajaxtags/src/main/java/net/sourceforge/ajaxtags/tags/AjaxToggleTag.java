/**
 * Copyright 2009 Jens Kapitza
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package net.sourceforge.ajaxtags.tags;

import javax.servlet.jsp.JspException;

import net.sourceforge.ajaxtags.helpers.DIVElement;
import net.sourceforge.ajaxtags.helpers.HTMLElementFactory;
import net.sourceforge.ajaxtags.helpers.JavaScript;



/**
 * Tag handler for the toggle (on/off, true/false) AJAX tag.
 * 
 * @author Darren Spurgeon
 * @author Jens Kapitza
 * @version $Revision: 86 $ $Date: 2007/06/20 20:55:56 $ $Author: jenskapitza $
 */
public class AjaxToggleTag extends BaseAjaxTag {

    private static final long serialVersionUID = 1L;
    private String ratings;
    private String defaultRating;
    private String state;
    private String onOff;
    private String containerClass;
    private String messageClass;
    private String selectedClass;
    private String selectedOverClass;
    private String selectedLessClass;
    private String overClass;
    private String updateFunction;


    public String getUpdateFunction() {
        return updateFunction;
    }


    public void setUpdateFunction(String updateFunction) {
        this.updateFunction = updateFunction;
    }


    public String getContainerClass() {
        return containerClass;
    }


    public void setContainerClass(String containerClass) {
        this.containerClass = containerClass;
    }


    public String getDefaultRating() {
        return defaultRating;
    }


    public void setDefaultRating(String defaultRating) {
        this.defaultRating = defaultRating;
    }


    public String getMessageClass() {
        return messageClass;
    }


    public void setMessageClass(String messageClass) {
        this.messageClass = messageClass;
    }


    public String getOnOff() {
        return onOff;
    }


    public void setOnOff(String onOff) {
        this.onOff = onOff;
    }


    public String getOverClass() {
        return overClass;
    }


    public void setOverClass(String overClass) {
        this.overClass = overClass;
    }


    public String getRatings() {
        return ratings;
    }


    public void setRatings(String ratings) {
        this.ratings = ratings;
    }


    public String getSelectedClass() {
        return selectedClass;
    }


    public void setSelectedClass(String selectedClass) {
        this.selectedClass = selectedClass;
    }


    public String getSelectedLessClass() {
        return selectedLessClass;
    }


    public void setSelectedLessClass(String selectedLessClass) {
        this.selectedLessClass = selectedLessClass;
    }


    public String getSelectedOverClass() {
        return selectedOverClass;
    }


    public void setSelectedOverClass(String selectedOverClass) {
        this.selectedOverClass = selectedOverClass;
    }


    public String getState() {
        return state;
    }


    public void setState(String state) {
        this.state = state;
    }


    @Override
    public int doEndTag() throws JspException {
        OptionsBuilder options = getOptionsBuilder();
        options.add("ratings", this.ratings, true).add("containerClass", this.containerClass, true)
                        .add("selectedClass", this.selectedClass, true).add("selectedOverClass",
                                        this.selectedOverClass, true).add("selectedLessClass",
                                        this.selectedLessClass, true).add("overClass",
                                        this.overClass, true);

        options.add("messageClass", this.messageClass, true);
        options.add("state", this.state, true);
        options.add("onOff", this.onOff, true);
        options.add("defaultRating", this.defaultRating, true);
        options.add("updateFunction", this.updateFunction, false);

        boolean xOnOff = Boolean.parseBoolean(this.onOff);

        // write opening div
        HTMLElementFactory div = new DIVElement(getSource());
        div.setClassName(xOnOff ? getContainerClass() + " onoff" : getContainerClass());

        // / TODO write this in javascript
        // / XXX write this in javascript!!!!
        // write links
        if (xOnOff) {
            div.append("<a href=\"").append(AJAX_VOID_URL).append("\" title=\"");
            if (defaultRating != null && defaultRating.length() != 0 && ratings != null
                            && ratings.length() != 0
                            && this.defaultRating.equalsIgnoreCase(this.ratings.split(",")[0])) {
                div.append(this.ratings.split(",")[0]).append("\" class=\"").append(
                                this.selectedClass).append("\"></a>");
            }
            else {
                div.append(this.ratings.split(",")[1]).append("\"></a>");
            }
        }
        else {
            boolean ratingMatch = false;
            String[] ratingValues = this.ratings.split(",");
            for (int i = 0; i < ratingValues.length; i++) {
                String val = ratingValues[i];
                div.append("<a href=\"").append(AJAX_VOID_URL).append("\" title=\"");

                if (defaultRating == null || defaultRating.trim().length() == 0 || ratingMatch) {
                    div.append(val).append("\"></a>");
                }
                else if (!ratingMatch || this.defaultRating.equalsIgnoreCase(val)) {
                    div.append(val).append("\" class=\"").append(this.selectedClass).append(
                                    "\"></a>");
                    if (this.defaultRating.equalsIgnoreCase(val)) {
                        ratingMatch = true;
                    }
                }
            }
        }

        // write script
        JavaScript js = new JavaScript();
        js.append(getJSVariable());
        js.append("new AjaxJspTag.Toggle( {\n").append(options.toString()).append("});\n");
        div.append(js);

        out(div);
        return EVAL_PAGE;
    }


    @Override
    public void releaseTag() {
        this.ratings = null;
        this.defaultRating = null;
        this.state = null;
        this.onOff = null;
        this.containerClass = null;
        this.messageClass = null;
        this.selectedClass = null;
        this.selectedOverClass = null;
        this.selectedLessClass = null;
        this.overClass = null;
    }
}