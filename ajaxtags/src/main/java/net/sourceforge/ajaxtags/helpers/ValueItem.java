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
package net.sourceforge.ajaxtags.helpers;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;



/**
 * holding the data for ValueListXmlBuilder
 * 
 * @author Jens Kapitza
 * @version $Revision: 86 $ $Date: 2007/07/22 16:29:15 $ $Author: jenskapitza $
 */
public class ValueItem extends AbstractItem<List<String>> {

    private static final long serialVersionUID = -5641651833544439174L;


    /**
     * build a SimpleNode
     * 
     * @param tagName
     *            name
     * @param asCData
     *            true if is cdate or false otherwise
     */
    public ValueItem(String tagName, boolean asCData) {
        this(tagName, null, asCData);
    }


    /**
     * build a SimpleNode
     * 
     * @param tagName
     *            name
     * @param value
     *            add one value
     * @param asCData
     *            true if is cdate or false otherwise
     */
    public ValueItem(String tagName, String value, boolean asCData) {
        this(tagName, asCData, value);
    }


    /**
     * build a SimpleNode
     * 
     * @param tagName
     *            name
     * @param asCData
     *            true if is cdate or false otherwise
     * @param value
     *            a list of values
     */
    public ValueItem(String tagName, boolean asCData, String... value) {
        super(tagName, new ArrayList<String>(), asCData);
        getValue().addAll(Arrays.asList(value));
    }


    /**
     * try to find the index of value
     * 
     * @param value
     *            the value to find
     * @return the index of this value
     * @see ArrayList#indexOf(Object)
     */
    public int indexOfValue(String value) {
        return getValue().indexOf(value);
    }


    /**
     * add values to this valueitem
     * 
     * @param values
     *            the value
     */
    public void addValue(String... values) {
        getValue().addAll(Arrays.asList(values));
    }


    /**
     * add values to this valueitem
     * 
     * @param values
     *            the value
     */
    public void addValue(List<String> values) {
        getValue().addAll(values);
    }


    /**
     * add a value to this valueitem
     * 
     * @param value
     *            the value
     */
    public void addValue(String value) {
        getValue().add(String.valueOf(value));
    }


    /**
     * removes an item at index i
     * 
     * @param i
     *            the index to remove
     * @return the removed item
     */
    public String remove(int i) {
        return getValue().remove(i);
    }
}
