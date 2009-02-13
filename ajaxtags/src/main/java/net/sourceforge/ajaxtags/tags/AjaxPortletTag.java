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
import net.sourceforge.ajaxtags.helpers.JavaScript;



/**
 * Tag handler for the portlet AJAX tag.
 * 
 * @author Darren Spurgeon
 * @author Jens Kapitza
 * @version $Revision: 86 $ $Date: 2007/06/28 21:50:35 $ $Author: jenskapitza $
 */
public class AjaxPortletTag extends BaseAjaxTag {

    private static final long serialVersionUID = 1L;

    private boolean startMinimize;


    public void setStartMinimize(boolean startMinimize) {
        this.startMinimize = startMinimize;
    }


    public boolean getStartMinimize() {
        return this.startMinimize;
    }


    private String classNamePrefix;
    private String title;
    private String imageClose;
    private String imageMaximize;
    private String imageMinimize;
    private String imageRefresh;
    private String refreshPeriod;
    private boolean executeOnLoad;


    public String getClassNamePrefix() {
        return classNamePrefix;
    }


    public void setClassNamePrefix(String classNamePrefix) {
        this.classNamePrefix = classNamePrefix;
    }


    public String getImageClose() {
        return imageClose;
    }


    public void setImageClose(String imageClose) {
        this.imageClose = imageClose;
    }


    public boolean getExecuteOnLoad() {
        return executeOnLoad;
    }


    public void setExecuteOnLoad(boolean executeOnLoad) {
        this.executeOnLoad = executeOnLoad;
    }


    public String getImageMaximize() {
        return imageMaximize;
    }


    public void setImageMaximize(String imageMaximize) {
        this.imageMaximize = imageMaximize;
    }


    public String getImageMinimize() {
        return imageMinimize;
    }


    public void setImageMinimize(String imageMinimize) {
        this.imageMinimize = imageMinimize;
    }


    public String getImageRefresh() {
        return imageRefresh;
    }


    public void setImageRefresh(String imageRefresh) {
        this.imageRefresh = imageRefresh;
    }


    public String getRefreshPeriod() {
        return refreshPeriod;
    }


    public void setRefreshPeriod(String refreshPeriod) {
        this.refreshPeriod = refreshPeriod;
    }


    public String getTitle() {
        return title;
    }


    public void setTitle(String title) {
        this.title = title;
    }


    @Override
    protected void initParameters() throws JspException {
        if (!this.withBar) {
            this.imageClose = null;
            this.imageMaximize = null;
            this.imageMinimize = null;
            this.imageRefresh = null;
        }
        super.initParameters();
    }


    @Override
    public int doEndTag() throws JspException {
        OptionsBuilder options = getOptionsBuilder();
        options.add("classNamePrefix", this.classNamePrefix, true);
        options.add("title", this.title, true);
        options.add("imageClose", this.imageClose, true);
        options.add("imageMaximize", this.imageMaximize, true);
        options.add("imageMinimize", this.imageMinimize, true);
        options.add("imageRefresh", this.imageRefresh, true);
        options.add("refreshPeriod", this.refreshPeriod, true);
        options.add("executeOnLoad", this.executeOnLoad);
        options.add("startMinimize", this.startMinimize);
        options.add("withBar", this.withBar);

        final DIVElement div = new DIVElement(getSource());
        final JavaScript script = new JavaScript();
        script.append(getJSVariable());
        script.append("new AjaxJspTag.Portlet({\n").append(options.toString()).append("});\n");
        div.setBody(script);
        out(div);
        return EVAL_PAGE;
    }


    @Override
    protected void releaseTag() {
        this.startMinimize = false;
        this.withBar = false;
        this.classNamePrefix = null;
        this.title = null;
        this.imageClose = null;
        this.imageMaximize = null;
        this.imageMinimize = null;
        this.imageRefresh = null;
        this.refreshPeriod = null;
        this.executeOnLoad = false;
    }


    public boolean getWithBar() {
        return withBar;
    }


    private boolean withBar;


    public void setWithBar(boolean withBar) {
        this.withBar = withBar;
    }
}