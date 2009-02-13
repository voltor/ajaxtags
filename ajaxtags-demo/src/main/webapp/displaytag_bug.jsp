<%--
This file is important for all wich will use displaytag
there are a lot of questions around displaytag and ajaxtags 
some of them talk a about a error with using EVAL_BODY_BUFFERED
any later SKIP_PAGE returns will make truble

XXX this file will reproduce the bug to find a resolution
--%>

<%@ taglib uri="http://displaytag.sf.net" prefix="display"%>

<%@ taglib uri="http://ajaxtags.sourceforge.net/tags/ajaxtags"
    prefix="ajax"%>
    
<%@page import="java.util.Date"%>
<%@page import="net.sourceforge.ajaxtags.demo.CarService"%>
<jsp:useBean id="now" class="java.util.Date" />
<jsp:useBean id="service" class="net.sourceforge.ajaxtags.demo.CarService" />


Last Time Table Refreshed: ${now}
<display:table uid="${now.time}" name="pageScope.service.allCars"
	class="displaytag" pagesize="10" defaultsort="1"
	defaultorder="descending" export="false" id="row" excludedParams="ajax">
	<display:column property="make" title="Make" sortable="true"
		headerClass="sortable" />
	<display:column title="Model" sortable="true"
		headerClass="sortable" >
		
     <a href="javascript://nop/" class="definition">${row.model}</a>
		
		</display:column>
	<display:column title="Link" media="html">
		<a href="http://www.${row.make}.com" >${row.make} Web Page</a>
	</display:column>
	<display:column title="Link" media="xml">www.${row.make}.com
    </display:column>
</display:table>


<ajax:callout baseUrl="callout.view" sourceClass="definition"
    parameters="q={ajaxParameter}" title="Definition" />
